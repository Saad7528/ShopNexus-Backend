import { Request, Response } from 'express';

export interface BackendLiveSession {
  id: string;
  ip: string;
  customerName: string;
  contactPhone?: string;
  country: string;
  countryCode: string;
  city: string;
  flag: string;
  isp: string;
  device: 'Desktop' | 'Mobile' | 'Tablet';
  deviceModel: string;
  browser: string;
  os: string;
  currentUrl: string;
  referrer: string;
  durationSeconds: number;
  pageviews: number;
  status: 'active' | 'idle' | 'blocked' | 'bot' | 'bounced';
  isCartActive: boolean;
  cartItemsCount?: number;
  cartValueBDT?: number;
  cartItemsSummary?: string;
  isBounced: boolean;
  startedAt: string;
  lastActiveAt: string;
  lastPingTimestamp: number;
}

// In-Memory Live Session Store
const liveSessionsMap = new Map<string, BackendLiveSession>();

// Cleanup inactive sessions older than 35 seconds
const cleanupInactiveSessions = () => {
  const now = Date.now();
  for (const [id, session] of liveSessionsMap.entries()) {
    if (now - session.lastPingTimestamp > 35000) {
      liveSessionsMap.delete(id);
    }
  }
};

/**
 * Public heartbeat endpoint called by storefront visitor tabs.
 * Supports cross-browser, incognito, and mobile storefront visitors.
 */
export const recordHeartbeat = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      sessionId,
      pathname = '/',
      device = 'Desktop',
      deviceModel = 'MacBook Pro 16" (Apple Silicon)',
      os = 'macOS Sonoma',
      browser = 'Google Chrome 124',
      userName,
      contactPhone,
      cartCount = 0,
      cartTotal = 0,
      referrer = 'Direct Storefront Visit',
    } = req.body;

    if (!sessionId) {
      res.status(400).json({ success: false, message: 'Session ID is required' });
      return;
    }

    cleanupInactiveSessions();

    const rawIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      '103.145.118.24';
    const clientIp = rawIp.includes('::') ? '103.145.118.24' : rawIp;

    const existing = liveSessionsMap.get(sessionId);
    const now = Date.now();

    if (existing) {
      const elapsed = Math.round((now - existing.lastPingTimestamp) / 1000);
      const isNewPage = existing.currentUrl !== pathname;
      existing.currentUrl = pathname;
      existing.durationSeconds += Math.max(1, Math.min(25, elapsed));
      existing.lastPingTimestamp = now;
      existing.lastActiveAt = 'Live Now';
      if (isNewPage) existing.pageviews += 1;
      if (userName) existing.customerName = `${userName} (Active Customer)`;
      if (contactPhone) existing.contactPhone = contactPhone;
      existing.isCartActive = cartCount > 0;
      existing.cartItemsCount = cartCount;
      existing.cartValueBDT = cartTotal;
      existing.device = device;
      existing.deviceModel = deviceModel;
      existing.os = os;
      existing.browser = browser;
      liveSessionsMap.set(sessionId, existing);
    } else {
      const newSession: BackendLiveSession = {
        id: sessionId,
        ip: clientIp,
        customerName: userName ? `${userName} (Active Customer)` : 'Guest Shopper (Storefront)',
        contactPhone,
        country: 'Bangladesh',
        countryCode: 'BD',
        city: 'Dhaka (Metropolitan & Gulshan)',
        flag: '🇧🇩',
        isp: 'Dhaka Fiber Gigabit Broadband',
        device,
        deviceModel,
        browser,
        os,
        currentUrl: pathname,
        referrer,
        durationSeconds: 1,
        pageviews: 1,
        status: 'active',
        isCartActive: cartCount > 0,
        cartItemsCount: cartCount,
        cartValueBDT: cartTotal,
        isBounced: false,
        startedAt: 'Just now',
        lastActiveAt: 'Live Now',
        lastPingTimestamp: now,
      };
      liveSessionsMap.set(sessionId, newSession);
    }

    res.status(200).json({
      success: true,
      activeSessionsCount: liveSessionsMap.size,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message: msg });
  }
};

/**
 * Retrieves all currently active live sessions across any tab/incognito/device.
 */
export const getLiveSessions = async (_req: Request, res: Response): Promise<void> => {
  try {
    cleanupInactiveSessions();
    const sessions = Array.from(liveSessionsMap.values());
    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message: msg });
  }
};
