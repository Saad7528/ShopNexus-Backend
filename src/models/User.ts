import { Schema, model, Document } from 'mongoose';

export type UserRole = 'customer' | 'vendor' | 'admin';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  avatar?: string;
  isEmailVerified: boolean;
  storeName?: string;
  storeDescription?: string;
  storeBanner?: string;
  storeLogo?: string;
  supportEmail?: string;
  supportPhone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    role: {
      type: String,
      enum: ['customer', 'vendor', 'admin'],
      default: 'customer',
    },
    avatar: {
      type: String,
      default: '',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    storeName: {
      type: String,
      trim: true,
    },
    storeDescription: {
      type: String,
      trim: true,
    },
    storeBanner: {
      type: String,
      trim: true,
    },
    storeLogo: {
      type: String,
      trim: true,
    },
    supportEmail: {
      type: String,
      trim: true,
    },
    supportPhone: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Method to strip sensitive fields
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.passwordHash;
  delete userObject.__v;
  return userObject;
};

export const User = model<IUser>('User', userSchema);
