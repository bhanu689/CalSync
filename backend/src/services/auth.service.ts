import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
import { Availability } from '../models/Availability';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../middleware/error.middleware';

const DEFAULT_WEEKLY_SCHEDULE = [
  { day: 0, enabled: false, slots: [] },
  { day: 1, enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
  { day: 2, enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
  { day: 3, enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
  { day: 4, enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
  { day: 5, enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
  { day: 6, enabled: false, slots: [] },
];

async function seedDefaultAvailability(userId: string): Promise<void> {
  await Availability.create({
    userId,
    name: 'Working Hours',
    isDefault: true,
    weeklySchedule: DEFAULT_WEEKLY_SCHEDULE,
    dateOverrides: [],
  });
}

function generateTokens(user: IUser) {
  const accessToken = signAccessToken({ userId: String(user._id), email: user.email });
  const refreshToken = signRefreshToken({
    userId: String(user._id),
    version: user.refreshTokenVersion,
  });
  return { accessToken, refreshToken };
}

function sanitizeUser(user: IUser) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    username: user.username,
    timezone: user.timezone,
    avatar: user.avatar || null,
    authProvider: user.authProvider,
  };
}

export const authService = {
  async register(data: { name: string; email: string; password: string; username: string }) {
    const existingEmail = await User.findOne({ email: data.email.toLowerCase() });
    if (existingEmail) {
      throw new AppError(409, 'CONFLICT', 'Email already registered');
    }

    const existingUsername = await User.findOne({ username: data.username.toLowerCase() });
    if (existingUsername) {
      throw new AppError(409, 'CONFLICT', 'Username already taken');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      username: data.username.toLowerCase(),
      passwordHash,
      authProvider: 'local',
    });

    await seedDefaultAvailability(String(user._id));

    const { accessToken, refreshToken } = generateTokens(user);
    return { accessToken, refreshToken, user: sanitizeUser(user) };
  },

  async login(data: { email: string; password: string }) {
    const user = await User.findOne({ email: data.email.toLowerCase() });
    if (!user || !user.passwordHash) {
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid email or password');
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid email or password');
    }

    const { accessToken, refreshToken } = generateTokens(user);
    return { accessToken, refreshToken, user: sanitizeUser(user) };
  },

  async refresh(refreshTokenStr: string) {
    try {
      const payload = verifyRefreshToken(refreshTokenStr);
      const user = await User.findById(payload.userId);

      if (!user || user.refreshTokenVersion !== payload.version) {
        throw new AppError(401, 'UNAUTHORIZED', 'Invalid refresh token');
      }

      const accessToken = signAccessToken({ userId: String(user._id), email: user.email });
      return { accessToken };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid refresh token');
    }
  },

  async logout(userId: string) {
    await User.findByIdAndUpdate(userId, { $inc: { refreshTokenVersion: 1 } });
  },

  async getMe(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(404, 'NOT_FOUND', 'User not found');
    }
    return sanitizeUser(user);
  },

  async updateProfile(userId: string, data: { name?: string; username?: string; timezone?: string }) {
    if (data.username) {
      const existing = await User.findOne({
        username: data.username.toLowerCase(),
        _id: { $ne: userId },
      });
      if (existing) {
        throw new AppError(409, 'CONFLICT', 'Username already taken');
      }
      data.username = data.username.toLowerCase();
    }

    const user = await User.findByIdAndUpdate(userId, { $set: data }, { new: true });
    if (!user) {
      throw new AppError(404, 'NOT_FOUND', 'User not found');
    }
    return sanitizeUser(user);
  },
};
