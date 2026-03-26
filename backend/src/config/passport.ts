import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env';
import { User } from '../models/User';
import { Availability } from '../models/Availability';

const DEFAULT_WEEKLY_SCHEDULE = [
  { day: 0, enabled: false, slots: [] },
  { day: 1, enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
  { day: 2, enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
  { day: 3, enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
  { day: 4, enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
  { day: 5, enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
  { day: 6, enabled: false, slots: [] },
];

export const configurePassport = () => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    console.warn('Google OAuth credentials not configured — skipping Google strategy');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email'],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email found in Google profile'));
          }

          // Check if user exists by googleId
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user);
          }

          // Check if user exists by email (account linking)
          user = await User.findOne({ email: email.toLowerCase() });

          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            user.authProvider = user.authProvider === 'local' ? 'both' : user.authProvider;
            if (!user.avatar && profile.photos?.[0]?.value) {
              user.avatar = profile.photos[0].value;
            }
            await user.save();
            return done(null, user);
          }

          // Create new user
          const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9-]/g, '-');
          // Ensure unique username
          let finalUsername = username;
          let counter = 1;
          while (await User.findOne({ username: finalUsername })) {
            finalUsername = `${username}-${counter}`;
            counter++;
          }

          user = await User.create({
            email: email.toLowerCase(),
            username: finalUsername,
            name: profile.displayName || email.split('@')[0],
            googleId: profile.id,
            avatar: profile.photos?.[0]?.value,
            authProvider: 'google',
            isEmailVerified: true,
          });

          // Seed default availability
          await Availability.create({
            userId: user._id,
            name: 'Working Hours',
            isDefault: true,
            weeklySchedule: DEFAULT_WEEKLY_SCHEDULE,
            dateOverrides: [],
          });

          return done(null, user);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};
