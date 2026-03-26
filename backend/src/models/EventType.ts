import mongoose, { Schema, Document } from 'mongoose';

export interface IEventType extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description?: string;
  durationMinutes: number;
  bufferBefore: number;
  bufferAfter: number;
  type: 'one-on-one' | 'group';
  maxAttendees?: number;
  location?: string;
  isActive: boolean;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventTypeSchema = new Schema<IEventType>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
    durationMinutes: { type: Number, required: true, min: 1 },
    bufferBefore: { type: Number, default: 0, min: 0 },
    bufferAfter: { type: Number, default: 0, min: 0 },
    type: { type: String, enum: ['one-on-one', 'group'], default: 'one-on-one' },
    maxAttendees: { type: Number, min: 1 },
    location: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    color: { type: String, default: '#3B82F6' },
  },
  { timestamps: true }
);

eventTypeSchema.index({ userId: 1, slug: 1 }, { unique: true });
eventTypeSchema.index({ userId: 1, isActive: 1 });

export const EventType = mongoose.model<IEventType>('EventType', eventTypeSchema);
