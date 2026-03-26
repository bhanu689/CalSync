import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  username: string;
  name: string;
  passwordHash?: string;
  avatar?: string;
  timezone: string;
  authProvider: 'local' | 'google' | 'both';
  googleId?: string;
  isEmailVerified: boolean;
  refreshTokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String },
    avatar: { type: String },
    timezone: { type: String, default: 'UTC' },
    authProvider: { type: String, enum: ['local', 'google', 'both'], default: 'local' },
    googleId: { type: String, sparse: true, unique: true },
    isEmailVerified: { type: Boolean, default: false },
    refreshTokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ googleId: 1 }, { sparse: true });

export const User = mongoose.model<IUser>('User', userSchema);
