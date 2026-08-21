import { Request, Response } from 'express';
import { VisualSearchService } from '../services/visual-search.service';
import { visualSearchSchema } from '../validations/visual-search.validation';

export const handleVisualSearch = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = visualSearchSchema.parse(req.body);
    const results = await VisualSearchService.searchByImage(validatedData);

    res.status(200).json({
      success: true,
      message: 'Visual search completed successfully',
      data: results,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors,
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Visual search failed',
    });
  }
};
