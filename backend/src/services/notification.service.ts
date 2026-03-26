import { Notification } from '../models/Notification';

export const notificationService = {
  async create(data: {
    userId: string;
    type: 'booking_created' | 'booking_cancelled' | 'booking_rescheduled' | 'reminder';
    title: string;
    message: string;
    metadata?: { bookingId?: string; eventTypeId?: string };
  }) {
    return Notification.create({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      metadata: data.metadata || {},
      isRead: false,
      emailSent: false,
    });
  },

  async list(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      Notification.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments({ userId }),
    ]);
    return {
      notifications: notifications.map((n) => ({
        id: n._id,
        type: n.type,
        title: n.title,
        message: n.message,
        metadata: n.metadata,
        isRead: n.isRead,
        createdAt: n.createdAt,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  async unreadCount(userId: string) {
    return Notification.countDocuments({ userId, isRead: false });
  },

  async markRead(id: string, userId: string) {
    return Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    );
  },

  async markAllRead(userId: string) {
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
  },
};
