import { Schema, model, Document, Types } from 'mongoose';

export interface ICartItem {
  productId: Types.ObjectId | string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  vendorName?: string;
  variant?: string;
}

export interface ICart extends Document {
  userId?: Types.ObjectId;
  guestId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  items: ICartItem[];
  subtotal: number;
  discount: number;
  appliedCoupon?: string;
  tax: number;
  total: number;
  status: 'Uncontacted' | 'WhatsApp Sent' | 'Discount Emailed' | 'Recovered';
  recoveryDiscountCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    productId: { type: Schema.Types.Mixed, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    image: { type: String, required: true },
    vendorName: { type: String, default: 'ShopNexus' },
    variant: { type: String, default: '' },
  },
  { _id: false }
);

const cartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    guestId: { type: String, index: true },
    customerName: { type: String, default: 'Guest Shopper' },
    customerPhone: { type: String, default: '+880 1700-000000' },
    customerEmail: { type: String, default: 'shopper@tempmail.io' },
    items: { type: [cartItemSchema], default: [] },
    subtotal: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    appliedCoupon: { type: String, default: null },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['Uncontacted', 'WhatsApp Sent', 'Discount Emailed', 'Recovered'],
      default: 'Uncontacted',
    },
    recoveryDiscountCode: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

// Auto-calculate cart financial totals before saving
cartSchema.pre('save', function (this: ICart) {
  this.subtotal = (this.items || []).reduce(
    (acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );
  this.tax = parseFloat((this.subtotal * 0.05).toFixed(2)); // 5% standard tax
  this.total = parseFloat(Math.max(0, this.subtotal - (Number(this.discount) || 0) + this.tax).toFixed(2));
});

export const Cart = model<ICart>('Cart', cartSchema);

