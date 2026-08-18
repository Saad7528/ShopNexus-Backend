import { Schema, model, Document, Types } from 'mongoose';

export interface IVariant {
  sku: string;
  name: string;
  price: number;
  stock: number;
  attributes: Record<string, string>; // e.g. { color: "Midnight Blue", size: "XL" }
}

export interface IProduct extends Document {
  title: string;
  slug: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: string[];
  vendorId: Types.ObjectId;
  vendorName: string;
  isFlashSale: boolean;
  flashSaleDiscountPercent?: number;
  averageRating: number;
  totalReviews: number;
  tags: string[];
  variants: IVariant[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const variantSchema = new Schema<IVariant>(
  {
    sku: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    attributes: { type: Map, of: String, default: {} },
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    brand: { type: String, required: true, index: true },
    price: { type: Number, required: true, min: 0, index: true },
    discountPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: { type: [String], default: [] },
    vendorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    vendorName: { type: String, required: true, default: 'ShopNexus Official' },
    isFlashSale: { type: Boolean, default: false, index: true },
    flashSaleDiscountPercent: { type: Number, default: 0, min: 0, max: 100 },
    averageRating: { type: Number, default: 0, min: 0, max: 5, index: true },
    totalReviews: { type: Number, default: 0, min: 0 },
    tags: { type: [String], default: [], index: true },
    variants: { type: [variantSchema], default: [] },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
);

// Compound index for search and category filtering
productSchema.index({ category: 1, price: 1, averageRating: -1 });

export const Product = model<IProduct>('Product', productSchema);
