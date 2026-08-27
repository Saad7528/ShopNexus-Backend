import { Schema, model, Document } from 'mongoose';

export type UserRole = 'customer' | 'vendor' | 'admin';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  avatar?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  country?: string;
  isEmailVerified: boolean;
  storeName?: string;
  storeDescription?: string;
  storeBanner?: string;
  storeLogo?: string;
  supportEmail?: string;
  supportPhone?: string;
  // Nexus Coins & Streak VIP Features
  nexusCoins: number;
  loginStreak: number;
  lastVisitDate?: string;
  isVipMember: boolean;
  vipFirstOrderUsed: boolean;
  // Security Features: Account Lockout & Password Reset
  failedLoginAttempts: number;
  lockUntil?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  isLocked: boolean;
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
    phoneNumber: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    zipCode: {
      type: String,
      trim: true,
      default: '',
    },
    country: {
      type: String,
      trim: true,
      default: 'Bangladesh',
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
    // Nexus Coins & Streak VIP Features
    nexusCoins: {
      type: Number,
      default: 0,
      min: 0,
    },
    loginStreak: {
      type: Number,
      default: 1,
      min: 1,
    },
    lastVisitDate: {
      type: String,
      default: '',
    },
    isVipMember: {
      type: Boolean,
      default: false,
    },
    vipFirstOrderUsed: {
      type: Boolean,
      default: false,
    },
    // Security fields
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual property to check if account is currently locked
userSchema.virtual('isLocked').get(function (this: IUser) {
  return !!(this.lockUntil && this.lockUntil.getTime() > Date.now());
});

// Method to strip sensitive fields
userSchema.methods.toJSON = function () {
  const userObject = this.toObject({ virtuals: true });
  delete userObject.passwordHash;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpires;
  delete userObject.__v;
  return userObject;
};

export const User = model<IUser>('User', userSchema);
