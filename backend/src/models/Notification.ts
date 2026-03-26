import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'booking_created' | 'booking_cancelled' | 'booking_rescheduled' | 'reminder';
  title: string;
  message: string;
  metadata: {
    bookingId?: mongoose.Types.ObjectId;
    eventTypeId?: mongoose.Types.ObjectId;
  };
  isRead: boolean;
  emailSent: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['booking_created', 'booking_cancelled', 'booking_rescheduled', 'reminder'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    metadata: {
      bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
      eventTypeId: { type: Schema.Types.ObjectId, ref: 'EventType' },
    },
    isRead: { type: Boolean, default: false },
    emailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
