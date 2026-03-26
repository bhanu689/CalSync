import mongoose, { Schema, Document } from 'mongoose';

export interface ICalendarIntegration extends Document {
  userId: mongoose.Types.ObjectId;
  provider: 'google' | 'outlook';
  accessToken: string;
  refreshToken: string;
  tokenExpiry: Date;
  calendarId: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const calendarIntegrationSchema = new Schema<ICalendarIntegration>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: String, enum: ['google', 'outlook'], required: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    tokenExpiry: { type: Date, required: true },
    calendarId: { type: String, required: true },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

calendarIntegrationSchema.index({ userId: 1, provider: 1 }, { unique: true });

export const CalendarIntegration = mongoose.model<ICalendarIntegration>(
  'CalendarIntegration',
  calendarIntegrationSchema
);
