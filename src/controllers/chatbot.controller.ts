import { Request, Response } from 'express';
import { ChatbotService } from '../services/chatbot.service';
import { chatMessageSchema } from '../validations/chatbot.validation';

export const handleChatMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = chatMessageSchema.parse(req.body);
    const result = await ChatbotService.processMessage(validatedData);

    res.status(200).json({
      success: true,
      data: result,
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
      message: error.message || 'Internal AI service error',
    });
  }
};
