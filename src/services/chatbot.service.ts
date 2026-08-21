import { Product } from '../models/Product';
import { ChatMessageInput } from '../validations/chatbot.validation';

interface SuggestedProduct {
  _id: string;
  title: string;
  price: number;
  discountPrice?: number;
  category: string;
  rating: number;
  image: string;
}

interface ChatbotResponse {
  reply: string;
  provider: 'gemini' | 'groq' | 'catalog-engine';
  suggestedProducts: SuggestedProduct[];
}

export class ChatbotService {
  /**
   * Main Conversational Discovery Handler with Multi-Provider Fallback (Rule 5)
   */
  public static async processMessage(input: ChatMessageInput): Promise<ChatbotResponse> {
    const { message, maxBudget, category } = input;

    // 1. Fetch relevant products from catalog matching budget/category/search
    const query: Record<string, any> = {};
    if (category && category !== 'All') {
      query.category = new RegExp(category, 'i');
    }
    if (maxBudget && maxBudget > 0) {
      query.price = { $lte: maxBudget };
    }

    const matchedProducts = await Product.find(query)
      .sort({ averageRating: -1 })
      .limit(6)
      .lean();

    const formattedProducts: SuggestedProduct[] = matchedProducts.map((p) => ({
      _id: (p._id as any).toString(),
      title: p.title,
      price: p.price,
      discountPrice: p.discountPrice,
      category: p.category,
      rating: p.averageRating || 4.8,
      image: p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    }));

    // 2. Multi-Provider Fallback Pipeline (Rule 5: Primary Gemini -> Secondary Groq -> Heuristic Engine)
    try {
      // Primary: Gemini API
      const geminiReply = await this.callGeminiAPI(message, formattedProducts, maxBudget);
      if (geminiReply) {
        return {
          reply: geminiReply,
          provider: 'gemini',
          suggestedProducts: formattedProducts,
        };
      }
    } catch (geminiError: any) {
      console.warn(`⚠️ [AI Fallback Triggered]: Gemini API unavailable (${geminiError.message}). Switching to Groq...`);
    }

    try {
      // Secondary Fallback: Groq API
      const groqReply = await this.callGroqAPI(message, formattedProducts, maxBudget);
      if (groqReply) {
        return {
          reply: groqReply,
          provider: 'groq',
          suggestedProducts: formattedProducts,
        };
      }
    } catch (groqError: any) {
      console.warn(`⚠️ [AI Fallback Triggered]: Groq API unavailable (${groqError.message}). Switching to Catalog Engine...`);
    }

    // Tertiary Resilient Fallback: Built-in E-Commerce Context Engine
    const heuristicReply = this.generateHeuristicReply(message, formattedProducts, maxBudget, category);
    return {
      reply: heuristicReply,
      provider: 'catalog-engine',
      suggestedProducts: formattedProducts,
    };
  }

  private static async callGeminiAPI(
    message: string,
    products: SuggestedProduct[],
    maxBudget?: number
  ): Promise<string | null> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    const catalogContext = products.map((p) => `- ${p.title} ($${p.price}, Rating: ${p.rating}★, Cat: ${p.category})`).join('\n');
    const prompt = `You are ShopNexus AI Shopping Assistant. Be friendly, concise, and helpful. User asks: "${message}". Budget: ${maxBudget ? `$${maxBudget}` : 'Any'}. Available items:\n${catalogContext}\nRecommend the best matching items with prices and direct helpful guidance in 2-3 sentences.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`Gemini API HTTP ${response.status}`);
    const data = (await response.json()) as any;
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  }

  private static async callGroqAPI(
    message: string,
    products: SuggestedProduct[],
    maxBudget?: number
  ): Promise<string | null> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return null;

    const catalogContext = products.map((p) => `- ${p.title} ($${p.price})`).join(', ');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'You are ShopNexus AI Assistant. Provide concise product advice based on catalog items.' },
          { role: 'user', content: `Query: ${message}. Budget: ${maxBudget || 'Flexible'}. Catalog: ${catalogContext}` },
        ],
        max_tokens: 150,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`Groq API HTTP ${response.status}`);
    const data = (await response.json()) as any;
    return data.choices?.[0]?.message?.content || null;
  }

  private static generateHeuristicReply(
    message: string,
    products: SuggestedProduct[],
    maxBudget?: number,
    category?: string
  ): string {
    if (products.length === 0) {
      return `I couldn't find exact matches for "${message}" ${maxBudget ? `under $${maxBudget}` : ''}. Try broadening your search or exploring our Audio and Electronics collections!`;
    }

    const topProduct = products[0];
    return `Based on your request "${message}", I recommend the **${topProduct.title}** for **$${topProduct.price}** (${topProduct.rating}★ rating). I've curated ${products.length} top-rated options matching your criteria below!`;
  }
}
