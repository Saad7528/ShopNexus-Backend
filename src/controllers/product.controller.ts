import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { Review } from '../models/Review';
import { createProductSchema, productQuerySchema, createReviewSchema } from '../validations/product.validation';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = productQuerySchema.parse(req.query);
    const page = parseInt(query.page, 10);
    const limit = parseInt(query.limit, 10);
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { isActive: true };

    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(query.search, 'i')] } },
      ];
    }

    if (query.category) {
      filter.category = query.category;
    }

    if (query.brand) {
      filter.brand = query.brand;
    }

    if (query.isFlashSale === 'true') {
      filter.isFlashSale = true;
    }

    if (query.minPrice || query.maxPrice) {
      filter.price = {};
      if (query.minPrice) filter.price.$gte = parseFloat(query.minPrice);
      if (query.maxPrice) filter.price.$lte = parseFloat(query.maxPrice);
    }

    if (query.minRating) {
      filter.averageRating = { $gte: parseFloat(query.minRating) };
    }

    let sort: Record<string, 1 | -1> = { createdAt: -1 };
    if (query.sortBy === 'price_asc') sort = { price: 1 };
    if (query.sortBy === 'price_desc') sort = { price: -1 };
    if (query.sortBy === 'rating') sort = { averageRating: -1 };

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch products',
    });
  }
};

export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug, isActive: true });

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    const reviews = await Review.find({ productId: product._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        product,
        reviews,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch product details',
    });
  }
};

export const createProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || (req.user.role !== 'vendor' && req.user.role !== 'admin')) {
      res.status(403).json({ success: false, message: 'Only vendors or admins can create products' });
      return;
    }

    const validatedData = createProductSchema.parse(req.body);
    const slug = validatedData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);

    const product = await Product.create({
      ...validatedData,
      slug,
      vendorId: req.user.userId,
      vendorName: req.user.email.split('@')[0],
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
      return;
    }
    res.status(500).json({ success: false, message: error.message || 'Failed to create product' });
  }
};

export const addProductReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const validatedData = createReviewSchema.parse(req.body);

    const review = await Review.create({
      productId: validatedData.productId,
      userId: req.user.userId,
      userName: req.user.email.split('@')[0],
      rating: validatedData.rating,
      comment: validatedData.comment,
    });

    // Recalculate product rating
    const allReviews = await Review.find({ productId: validatedData.productId });
    const avgRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;

    await Product.findByIdAndUpdate(validatedData.productId, {
      averageRating: parseFloat(avgRating.toFixed(1)),
      totalReviews: allReviews.length,
    });

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: { review },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
      return;
    }
    res.status(500).json({ success: false, message: error.message || 'Failed to add review' });
  }
};
