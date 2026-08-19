import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { User, IUser } from '../models/User';
import { Product } from '../models/Product';
import { updateVendorProfileSchema } from '../validations/vendor.validation';

export const getVendorProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const vendor = await User.findById(userId).select('-password');
    if (!vendor || (vendor.role !== 'vendor' && vendor.role !== 'admin')) {
      res.status(403).json({ success: false, message: 'Vendor access required' });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: vendor._id.toString(),
        name: vendor.name,
        email: vendor.email,
        role: vendor.role,
        storeName: vendor.storeName || '',
        storeDescription: vendor.storeDescription || '',
        storeBanner: vendor.storeBanner || '',
        storeLogo: vendor.storeLogo || '',
        supportEmail: vendor.supportEmail || vendor.email,
        supportPhone: vendor.supportPhone || '',
        createdAt: vendor.createdAt,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message: errorMessage });
  }
};

export const updateVendorProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const validatedData = updateVendorProfileSchema.parse(req.body);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          storeName: validatedData.storeName,
          storeDescription: validatedData.storeDescription || '',
          storeBanner: validatedData.storeBanner || '',
          storeLogo: validatedData.storeLogo || '',
          supportEmail: validatedData.supportEmail || '',
          supportPhone: validatedData.supportPhone || '',
        },
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({ success: false, message: 'Vendor profile not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Vendor store profile updated successfully',
      data: updatedUser,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Validation error';
    res.status(400).json({ success: false, message: errorMessage });
  }
};

export const getPublicVendorShop = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { vendorId } = req.params;

    const vendor = await User.findById(vendorId).select('-password');
    if (!vendor || (vendor.role !== 'vendor' && vendor.role !== 'admin')) {
      res.status(404).json({ success: false, message: 'Storefront not found' });
      return;
    }

    const products = await Product.find({ vendor: vendor._id, isActive: true }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        vendor: {
          id: vendor._id.toString(),
          name: vendor.name,
          storeName: vendor.storeName || `${vendor.name}'s Official Store`,
          storeDescription: vendor.storeDescription || 'Premium verified seller on ShopNexus.',
          storeBanner: vendor.storeBanner || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
          storeLogo: vendor.storeLogo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
          supportEmail: vendor.supportEmail || vendor.email,
        },
        products,
        totalProducts: products.length,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    res.status(500).json({ success: false, message: errorMessage });
  }
};
