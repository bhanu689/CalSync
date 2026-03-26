import { EventType } from '../models/EventType';
import { AppError } from '../middleware/error.middleware';
import { slugify } from '../utils/slugify';

export const eventTypeService = {
  async list(userId: string) {
    return EventType.find({ userId }).sort({ createdAt: -1 });
  },

  async getById(id: string, userId: string) {
    const eventType = await EventType.findOne({ _id: id, userId });
    if (!eventType) {
      throw new AppError(404, 'NOT_FOUND', 'Event type not found');
    }
    return eventType;
  },

  async create(userId: string, data: {
    title: string;
    slug?: string;
    description?: string;
    durationMinutes: number;
    bufferBefore?: number;
    bufferAfter?: number;
    type?: 'one-on-one' | 'group';
    maxAttendees?: number;
    location?: string;
    color?: string;
  }) {
    const slug = data.slug ? slugify(data.slug) : slugify(data.title);

    const existing = await EventType.findOne({ userId, slug });
    if (existing) {
      throw new AppError(409, 'CONFLICT', 'An event type with this slug already exists');
    }

    return EventType.create({
      userId,
      ...data,
      slug,
      maxAttendees: data.type === 'group' ? (data.maxAttendees || 10) : undefined,
    });
  },

  async update(id: string, userId: string, data: {
    title?: string;
    slug?: string;
    description?: string;
    durationMinutes?: number;
    bufferBefore?: number;
    bufferAfter?: number;
    type?: 'one-on-one' | 'group';
    maxAttendees?: number;
    location?: string;
    color?: string;
  }) {
    if (data.slug) {
      data.slug = slugify(data.slug);
      const existing = await EventType.findOne({ userId, slug: data.slug, _id: { $ne: id } });
      if (existing) {
        throw new AppError(409, 'CONFLICT', 'An event type with this slug already exists');
      }
    }

    const eventType = await EventType.findOneAndUpdate(
      { _id: id, userId },
      { $set: data },
      { new: true }
    );

    if (!eventType) {
      throw new AppError(404, 'NOT_FOUND', 'Event type not found');
    }

    return eventType;
  },

  async delete(id: string, userId: string) {
    const eventType = await EventType.findOneAndDelete({ _id: id, userId });
    if (!eventType) {
      throw new AppError(404, 'NOT_FOUND', 'Event type not found');
    }
  },

  async toggle(id: string, userId: string) {
    const eventType = await EventType.findOne({ _id: id, userId });
    if (!eventType) {
      throw new AppError(404, 'NOT_FOUND', 'Event type not found');
    }

    eventType.isActive = !eventType.isActive;
    await eventType.save();
    return eventType;
  },
};
