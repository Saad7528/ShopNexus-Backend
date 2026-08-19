import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { Wishlist } from '../models/Wishlist';
import { Types } from 'mongoose';

export const getWishlist = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    let wishlist = await Wishlist.findOne({ user: userId }).populate('items.productId');
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, items: [] });
    }

    res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message: errorMessage });
  }
};

export const toggleWishlistItem = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { productId } = req.body;
    if (!productId) {
      res.status(400).json({ success: false, message: 'Product ID is required' });
      return;
    }

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, items: [] });
    }

    const productObjectId = new Types.ObjectId(productId);
    const existingIndex = wishlist.items.findIndex((item) =>
      item.productId.toString() === productId
    );

    let isAdded = false;
    if (existingIndex > -1) {
      // Remove item
      wishlist.items.splice(existingIndex, 1);
      isAdded = false;
    } else {
      // Add item
      wishlist.items.push({ productId: productObjectId, addedAt: new Date() });
      isAdded = true;
    }

    await wishlist.save();
    await wishlist.populate('items.productId');

    res.status(200).json({
      success: true,
      message: isAdded ? 'Item added to wishlist' : 'Item removed from wishlist',
      isAdded,
      data: wishlist,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message: errorMessage });
  }
};
