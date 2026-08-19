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
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const validatedData = createOrderSchema.parse(req.body);

    const subtotal = validatedData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const taxAmount = parseFloat((subtotal * 0.05).toFixed(2)); // 5% tax
    const shippingFee = subtotal > 150 ? 0 : 15; // Free shipping over $150
    const totalAmount = parseFloat((subtotal + taxAmount + shippingFee).toFixed(2));

    const trackingNumber = `NEX-${Date.now().toString().slice(-6)}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);

    const orderItems = validatedData.items.map((item) => ({
      product: new Types.ObjectId(item.productId),
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    }));

    const order = await Order.create({
      user: userId,
      items: orderItems,
      shippingAddress: validatedData.shippingAddress,
      paymentMethod: validatedData.paymentMethod,
      paymentStatus: validatedData.paymentMethod === 'cash_on_delivery' ? 'pending' : 'paid',
      orderStatus: 'processing',
      subtotal,
      taxAmount,
      shippingFee,
      discountAmount: 0,
      totalAmount,
      trackingNumber,
      estimatedDelivery: deliveryDate,
    });

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
    const userId = req.user?._id;
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
    const userId = req.user?._id;

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    // Verify customer ownership or admin role
    if (order.user.toString() !== userId?.toString() && req.user?.role !== 'admin') {
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
