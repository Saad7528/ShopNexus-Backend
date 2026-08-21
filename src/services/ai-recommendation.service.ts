import { Product } from '../models/Product';
import { RecommendationQueryInput } from '../validations/recommendation.validation';

export class AIRecommendationService {
  /**
   * "Frequently Bought Together" bundle affinity algorithm
   */
  public static async getFrequentlyBoughtTogether(productId: string): Promise<{
    mainProduct: any;
    bundleItems: any[];
    totalBundlePrice: number;
    bundleDiscountPrice: number;
    savingsAmount: number;
  }> {
    const mainProduct = await Product.findById(productId).lean();
    if (!mainProduct) {
      throw new Error('Product not found');
    }

    // Find complementary accessories in the same or adjacent category
    const complementary = await Product.find({
      _id: { $ne: mainProduct._id },
      category: mainProduct.category,
      stock: { $gt: 0 },
    })
      .sort({ ratingCount: -1, averageRating: -1 })
      .limit(2)
      .lean();

    const allItems = [mainProduct, ...complementary];
    const totalBundlePrice = Number(
      allItems.reduce((sum, item) => sum + (item.price || 0), 0).toFixed(2)
    );
    // 15% special bundle discount
    const bundleDiscountPrice = Number((totalBundlePrice * 0.85).toFixed(2));
    const savingsAmount = Number((totalBundlePrice - bundleDiscountPrice).toFixed(2));

    return {
      mainProduct,
      bundleItems: complementary,
      totalBundlePrice,
      bundleDiscountPrice,
      savingsAmount,
    };
  }

  /**
   * Personalized User Recommendations based on browsing category weights
   */
  public static async getPersonalizedFeed(input: RecommendationQueryInput): Promise<any[]> {
    const { category, limit = 6, excludeId } = input;
    const query: Record<string, any> = { stock: { $gt: 0 } };

    if (category) {
      query.category = new RegExp(category, 'i');
    }
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    return await Product.find(query)
      .sort({ isFeatured: -1, averageRating: -1 })
      .limit(limit)
      .lean();
  }
}
