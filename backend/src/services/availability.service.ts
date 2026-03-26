import { Availability } from '../models/Availability';
import { AppError } from '../middleware/error.middleware';

export const availabilityService = {
  async list(userId: string) {
    return Availability.find({ userId }).sort({ isDefault: -1, createdAt: 1 });
  },

  async getById(id: string, userId: string) {
    const availability = await Availability.findOne({ _id: id, userId });
    if (!availability) {
      throw new AppError(404, 'NOT_FOUND', 'Availability schedule not found');
    }
    return availability;
  },

  async create(userId: string, data: {
    name: string;
    isDefault?: boolean;
    weeklySchedule: Array<{ day: number; enabled: boolean; slots: Array<{ start: string; end: string }> }>;
    dateOverrides?: Array<{ date: string; enabled: boolean; slots: Array<{ start: string; end: string }> }>;
  }) {
    // If setting as default, unset other defaults
    if (data.isDefault) {
      await Availability.updateMany({ userId }, { isDefault: false });
    }

    return Availability.create({
      userId,
      ...data,
      dateOverrides: data.dateOverrides || [],
    });
  },

  async update(id: string, userId: string, data: {
    name?: string;
    isDefault?: boolean;
    weeklySchedule?: Array<{ day: number; enabled: boolean; slots: Array<{ start: string; end: string }> }>;
    dateOverrides?: Array<{ date: string; enabled: boolean; slots: Array<{ start: string; end: string }> }>;
  }) {
    if (data.isDefault) {
      await Availability.updateMany({ userId, _id: { $ne: id } }, { isDefault: false });
    }

    const availability = await Availability.findOneAndUpdate(
      { _id: id, userId },
      { $set: data },
      { new: true }
    );

    if (!availability) {
      throw new AppError(404, 'NOT_FOUND', 'Availability schedule not found');
    }

    return availability;
  },

  async delete(id: string, userId: string) {
    const count = await Availability.countDocuments({ userId });
    if (count <= 1) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Cannot delete your only availability schedule');
    }

    const availability = await Availability.findOneAndDelete({ _id: id, userId });
    if (!availability) {
      throw new AppError(404, 'NOT_FOUND', 'Availability schedule not found');
    }

    // If deleted was default, make another one default
    if (availability.isDefault) {
      await Availability.findOneAndUpdate({ userId }, { isDefault: true });
    }
  },
};
