import mongoose, { Schema, Document } from 'mongoose';

export interface ITimeSlot {
  start: string; // "09:00" HH:mm
  end: string;   // "17:00" HH:mm
}

export interface IDaySchedule {
  day: number;   // 0 = Sunday, 6 = Saturday
  enabled: boolean;
  slots: ITimeSlot[];
}

export interface IDateOverride {
  date: string;  // "2026-04-15" ISO date
  enabled: boolean;
  slots: ITimeSlot[];
}

export interface IAvailability extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  isDefault: boolean;
  weeklySchedule: IDaySchedule[];
  dateOverrides: IDateOverride[];
  createdAt: Date;
  updatedAt: Date;
}

const timeSlotSchema = new Schema<ITimeSlot>(
  {
    start: { type: String, required: true },
    end: { type: String, required: true },
  },
  { _id: false }
);

const dayScheduleSchema = new Schema<IDaySchedule>(
  {
    day: { type: Number, required: true, min: 0, max: 6 },
    enabled: { type: Boolean, default: false },
    slots: [timeSlotSchema],
  },
  { _id: false }
);

const dateOverrideSchema = new Schema<IDateOverride>(
  {
    date: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    slots: [timeSlotSchema],
  },
  { _id: false }
);

const availabilitySchema = new Schema<IAvailability>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
    weeklySchedule: { type: [dayScheduleSchema], required: true },
    dateOverrides: { type: [dateOverrideSchema], default: [] },
  },
  { timestamps: true }
);

availabilitySchema.index({ userId: 1 });
availabilitySchema.index({ userId: 1, isDefault: 1 });

export const Availability = mongoose.model<IAvailability>('Availability', availabilitySchema);
