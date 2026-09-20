import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { Order } from '../models/Order';
import { createOrderSchema } from '../validations/order.validation';
import { Types } from 'mongoose';

export const createOrder = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id || req.user?.userId;
    const validatedData = createOrderSchema.parse(req.body);

    const subtotal = validatedData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const taxAmount = parseFloat((subtotal * 0.05).toFixed(2)); // 5% tax
    const shippingFee = subtotal > 150 ? 0 : (req.body.shippingFee ?? 60);
    const totalAmount = parseFloat((subtotal + taxAmount + shippingFee).toFixed(2));

    // Dynamic clean NX-XXX-XXXX format invoice / tracking number
    const prefixRand = Math.floor(100 + Math.random() * 900);
    const suffixRand = Math.floor(1000 + Math.random() * 9000);
    const trackingNumber = `NX-${prefixRand}-${suffixRand}`;

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);

    const orderItems = validatedData.items.map((item) => ({
      product: Types.ObjectId.isValid(item.productId)
        ? new Types.ObjectId(item.productId)
        : undefined,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    }));

    const orderData: Record<string, unknown> = {
      items: orderItems,
      shippingAddress: validatedData.shippingAddress,
      paymentMethod: validatedData.paymentMethod,
      paymentStatus: validatedData.paymentMethod === 'cash_on_delivery' ? 'pending' : 'paid',
      orderStatus: 'pending',
      subtotal,
      taxAmount,
      shippingFee,
      discountAmount: 0,
      totalAmount,
      trackingNumber,
      courier: req.body.courier || 'Pathao Courier',
      estimatedDelivery: deliveryDate,
    };

    if (userId && Types.ObjectId.isValid(userId)) {
      orderData.user = new Types.ObjectId(userId);
    }

    const order = await Order.create(orderData);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    res.status(400).json({ success: false, message: errorMessage });
  }
};

export const getMyOrders = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id || req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message: errorMessage });
  }
};

export const getOrderById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.userId;

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    // Allow owner, admin, or guest lookup by exact order ID
    if (
      order.user &&
      userId &&
      order.user.toString() !== userId.toString() &&
      req.user?.role !== 'admin'
    ) {
      res.status(403).json({ success: false, message: 'Access denied to this order' });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message: errorMessage });
  }
};

/**
 * Public real-time tracking lookup by Tracking Code or Order ID.
 * No login required.
 * @route GET /api/orders/track/:trackingNumber
 * @access Public
 */
export const trackOrderPublic = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const rawCode = (req.params.trackingNumber || '').trim();
    if (!rawCode) {
      res.status(400).json({ success: false, message: 'Tracking number or Order ID is required' });
      return;
    }

    const cleanCode = rawCode.replace(/^[#\s]+/, '');

    // Search by tracking number or _id
    const queryConditions: Array<Record<string, unknown>> = [
      { trackingNumber: { $regex: new RegExp(`^${cleanCode.replace(/^NX-/, '(NX-|NEX-)')}`, 'i') } },
      { trackingNumber: { $regex: new RegExp(cleanCode, 'i') } },
    ];

    if (Types.ObjectId.isValid(cleanCode)) {
      queryConditions.push({ _id: new Types.ObjectId(cleanCode) });
    }

    const order = await Order.findOne({ $or: queryConditions }).lean();

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'No order found with this tracking number or ID',
      });
      return;
    }

    // Determine current stage index (1 to 5)
    // 1: Placed/Pending, 2: Confirmed, 3: Packaging/Processing, 4: In Transit/Shipped, 5: Delivered
    let currentStage = 1;
    const status = (order.orderStatus || 'pending').toLowerCase();
    if (status === 'confirmed') currentStage = 2;
    else if (status === 'processing' || status === 'packaging') currentStage = 3;
    else if (status === 'shipped' || status === 'in_transit') currentStage = 4;
    else if (status === 'delivered') currentStage = 5;
    else if (status === 'cancelled') currentStage = 0;

    const createdAtDate = order.createdAt ? new Date(order.createdAt) : new Date();

    const stages = [
      {
        key: 'PLACED',
        stepNumber: 1,
        labelEn: 'Order Placed',
        labelBn: 'অর্ডার গ্রহণ',
        descEn: 'Order placed & received in queue',
        descBn: 'অর্ডার সফলভাবে সিস্টেমে গ্রহণ করা হয়েছে',
        completed: currentStage >= 1,
        active: currentStage === 1,
        time: createdAtDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: createdAtDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      },
      {
        key: 'CONFIRMED',
        stepNumber: 2,
        labelEn: 'Confirmed',
        labelBn: 'নিশ্চিতকৃত',
        descEn: 'Verified by inventory team',
        descBn: 'ইনভেন্টরি ও পেমেন্ট টিম দ্বারা নিশ্চিত করা হয়েছে',
        completed: currentStage >= 2,
        active: currentStage === 2,
        time: currentStage >= 2 ? 'Verified' : '--:--',
        date: createdAtDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      },
      {
        key: 'PACKAGING',
        stepNumber: 3,
        labelEn: 'Packaging & QC',
        labelBn: 'প্যাকেজিং ও QC',
        descEn: 'Quality check passed & securely packed',
        descBn: 'কোয়ালিটি চেক শেষে সুরক্ষিতভাবে প্যাক করা হয়েছে',
        completed: currentStage >= 3,
        active: currentStage === 3,
        time: currentStage >= 3 ? 'Packed' : '--:--',
        date: createdAtDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      },
      {
        key: 'SHIPPED',
        stepNumber: 4,
        labelEn: 'Dispatched & On the Way',
        labelBn: 'পথে রয়েছে (Shipped)',
        descEn: `Handed over to ${order.courier || 'Pathao Courier Express'}`,
        descBn: `${order.courier || 'পাঠাও কুরিয়ার'}-এর মাধ্যমে ডেলিভারির জন্য পাঠানো হয়েছে`,
        completed: currentStage >= 4,
        active: currentStage === 4,
        time: currentStage >= 4 ? 'In Transit' : '--:--',
        date: createdAtDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      },
      {
        key: 'DELIVERED',
        stepNumber: 5,
        labelEn: 'Delivered',
        labelBn: 'ডেলিভারি সম্পন্ন',
        descEn: 'Successfully handed over to recipient',
        descBn: 'গ্রাহকের হাতে সফলভাবে হস্তান্তর করা হয়েছে',
        completed: currentStage >= 5,
        active: currentStage === 5,
        time: currentStage >= 5 ? 'Completed' : '--:--',
        date: order.updatedAt ? new Date(order.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--',
      },
    ];

    res.status(200).json({
      success: true,
      data: {
        _id: order._id,
        orderNumber: order.trackingNumber || `NX-${order._id.toString().slice(-8)}`,
        trackingNumber: order.trackingNumber || `NX-${order._id.toString().slice(-8)}`,
        status: order.orderStatus,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        subtotal: order.subtotal,
        taxAmount: order.taxAmount,
        shippingFee: order.shippingFee,
        discountAmount: order.discountAmount,
        totalAmount: order.totalAmount,
        courier: order.courier || 'Pathao Courier Express',
        estimatedDelivery: order.estimatedDelivery || 'Within 24-48h',
        shippingAddress: order.shippingAddress,
        items: order.items,
        currentStage,
        stages,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message: errorMessage });
  }
};

