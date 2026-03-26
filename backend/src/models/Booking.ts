import mongoose, { Schema, Document } from 'mongoose';

export interface IInvitee {
  name: string;
  email: string;
  timezone: string;
}

export interface IBooking extends Document {
  eventTypeId: mongoose.Types.ObjectId;
  hostUserId: mongoose.Types.ObjectId;
  invitee: IInvitee;
  startTime: Date;
  endTime: Date;
  status: 'confirmed' | 'cancelled' | 'rescheduled';
  cancelReason?: string;
  additionalAttendees?: IInvitee[];
  calendarEventId?: string;
  calendarProvider?: string;
  meetingLink?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const inviteeSchema = new Schema<IInvitee>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    timezone: { type: String, required: true },
  },
  { _id: false }
);

const bookingSchema = new Schema<IBooking>(
  {
    eventTypeId: { type: Schema.Types.ObjectId, ref: 'EventType', required: true },
    hostUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    invitee: { type: inviteeSchema, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ['confirmed', 'cancelled', 'rescheduled'], default: 'confirmed' },
    cancelReason: { type: String },
    additionalAttendees: [inviteeSchema],
    calendarEventId: { type: String },
    calendarProvider: { type: String },
    meetingLink: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

bookingSchema.index({ hostUserId: 1, startTime: 1 });
bookingSchema.index({ eventTypeId: 1, startTime: 1 });
bookingSchema.index({ 'invitee.email': 1 });
bookingSchema.index({ status: 1 });

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);
