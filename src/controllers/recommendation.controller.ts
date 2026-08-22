import { Request, Response } from 'express';
import { AIRecommendationService } from '../services/ai-recommendation.service';
import { recommendationQuerySchema } from '../validations/recommendation.validation';

export const getFrequentlyBought = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawProductId = req.params.productId;
    const productId = Array.isArray(rawProductId) ? rawProductId[0] : rawProductId;

    if (!productId) {
      res.status(400).json({ success: false, message: 'Product ID is required' });
      return;
    }

    const data = await AIRecommendationService.getFrequentlyBoughtTogether(productId);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch bundle recommendations',
    });
  }
};

export const getPersonalized = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedQuery = recommendationQuerySchema.parse(req.query);
    const products = await AIRecommendationService.getPersonalizedFeed(validatedQuery);

    res.status(200).json({
      success: true,
      data: { products },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch personalized feed',
    });
  }
};
