import { Request, Response } from 'express';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const getCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
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

export const addItemToCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { guestId, productId, quantity = 1 } = req.body;

    if (!productId) {
      res.status(400).json({ success: false, message: 'Product ID is required' });
      return;
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      res.status(404).json({ success: false, message: 'Product is unavailable or out of stock' });
      return;
    }

    if (product.stock < quantity) {
      res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${product.stock} items remaining.`,
      });
      return;
    }

    const effectivePrice = product.isFlashSale && product.discountPrice ? product.discountPrice : product.price;
    const query = userId ? { userId } : { guestId };

    let cart = await Cart.findOne(query);
    if (!cart) {
      cart = new Cart({ ...query, items: [] });
    }

    const existingItemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].price = effectivePrice;
    } else {
      cart.items.push({
        productId: product._id as any,
        title: product.title,
        price: effectivePrice,
        quantity,
        image: product.images[0] || '',
        vendorName: product.vendorName,
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
    const userId = req.user?.userId;
    const { guestId, productId, quantity } = req.body;

    const query = userId ? { userId } : { guestId };
    const cart = await Cart.findOne(query);

    if (!cart) {
      res.status(404).json({ success: false, message: 'Cart not found' });
      return;
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
    } else {
      const item = cart.items.find((item) => item.productId.toString() === productId);
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
    const userId = req.user?.userId;
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
