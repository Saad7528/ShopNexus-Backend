import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const getCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId || req.user?._id;
    const guestId = req.query.guestId as string;

    if (!userId && !guestId) {
      res.status(400).json({ success: false, message: 'User ID or Guest ID required' });
      return;
    }

    const query = userId ? { userId } : { guestId };
    let cart = await Cart.findOne(query);

    if (!cart) {
      cart = await Cart.create({ ...query, items: [] });
    }

    res.status(200).json({ success: true, data: { cart } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch cart' });
  }
};

/**
 * Real-time Bidirectional Cart Sync for Abandoned Cart Engine & Multi-device Persistence
 * @route POST /api/cart/sync
 */
export const syncCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId || req.user?._id;
    const { items = [], appliedCoupon, discount = 0, guestId, customerName, customerPhone, customerEmail } = req.body;

    if (!userId && !guestId) {
      res.status(400).json({ success: false, message: 'User ID or Guest ID required for cart sync' });
      return;
    }

    let user: any = null;
    if (userId) {
      user = await User.findById(userId).select('name email phoneNumber');
    }

    let cart = null;
    if (userId) {
      cart = await Cart.findOne({ userId });
      if (!cart && guestId) {
        cart = await Cart.findOne({ guestId });
      }
    } else if (guestId) {
      cart = await Cart.findOne({ guestId });
    }

    if (!cart) {
      cart = new Cart({
        ...(userId ? { userId } : {}),
        guestId: guestId || undefined,
        items: [],
      });
    }

    if (userId) {
      cart.userId = userId as any;
    }
    if (guestId) {
      cart.guestId = guestId;
    }

    // Populate customer details for live recovery engine
    if (user) {
      cart.customerName = user.name || cart.customerName || 'Customer';
      cart.customerEmail = user.email || cart.customerEmail || 'shopper@tempmail.io';
      cart.customerPhone = user.phoneNumber || cart.customerPhone || '+880 1700-000000';
    } else {
      if (customerName) cart.customerName = customerName;
      if (customerEmail) cart.customerEmail = customerEmail;
      if (customerPhone) cart.customerPhone = customerPhone;
    }

    // Map items cleanly (supporting product IDs, combo bundles, variants)
    cart.items = (items || []).map((i: any) => ({
      productId: i.productId || i.id || 'p-unknown',
      title: i.title || 'Product Item',
      price: Number(i.price) || 0,
      quantity: Math.max(1, Number(i.quantity) || 1),
      image: i.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
      vendorName: i.vendorName || 'ShopNexus',
      variant: i.variant || '',
    }));

    cart.appliedCoupon = appliedCoupon || null;
    cart.discount = Number(discount) || 0;

    if (!cart.status) {
      cart.status = 'Uncontacted';
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart synchronized with database successfully',
      data: { cart },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to sync cart' });
  }
};

export const addItemToCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId || req.user?._id;
    const { guestId, productId, title, price, image, vendorName, variant, quantity = 1 } = req.body;

    if (!productId) {
      res.status(400).json({ success: false, message: 'Product ID is required' });
      return;
    }

    let effectivePrice = price || 0;
    let itemTitle = title || 'Product Item';
    let itemImage = image || '';
    let itemVendor = vendorName || 'ShopNexus';

    if (Types.ObjectId.isValid(productId)) {
      const product = await Product.findById(productId);
      if (product && product.isActive) {
        effectivePrice = product.isFlashSale && product.discountPrice ? product.discountPrice : product.price;
        itemTitle = product.title;
        itemImage = product.images[0] || itemImage;
        itemVendor = product.vendorName || itemVendor;
      }
    }

    const query = userId ? { userId } : { guestId };
    let cart = await Cart.findOne(query);
    if (!cart) {
      cart = new Cart({ ...query, items: [] });
    }

    const existingItemIndex = cart.items.findIndex((item) => item.productId.toString() === productId.toString());

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].price = effectivePrice;
    } else {
      cart.items.push({
        productId,
        title: itemTitle,
        price: effectivePrice,
        quantity,
        image: itemImage,
        vendorName: itemVendor,
        variant: variant || '',
      });
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: { cart },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to add item to cart' });
  }
};

export const updateCartItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId || req.user?._id;
    const { guestId, productId, quantity } = req.body;

    const query = userId ? { userId } : { guestId };
    const cart = await Cart.findOne(query);

    if (!cart) {
      res.status(404).json({ success: false, message: 'Cart not found' });
      return;
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter((item) => item.productId.toString() !== productId.toString());
    } else {
      const item = cart.items.find((item) => item.productId.toString() === productId.toString());
      if (item) {
        item.quantity = quantity;
      }
    }

    await cart.save();
    res.status(200).json({ success: true, message: 'Cart updated', data: { cart } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update cart' });
  }
};

export const clearCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId || req.user?._id;
    const guestId = req.query.guestId as string;

    const query = userId ? { userId } : { guestId };
    const cart = await Cart.findOne(query);

    if (cart) {
      cart.items = [];
      cart.discount = 0;
      cart.appliedCoupon = undefined;
      await cart.save();
    }

    res.status(200).json({ success: true, message: 'Cart cleared', data: { cart } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to clear cart' });
  }
};

