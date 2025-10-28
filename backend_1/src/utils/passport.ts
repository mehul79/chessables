import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import dotenv from 'dotenv';
import  db  from '../utils/db';
dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;




export function initPassport() {
  console.log("reached initPassport");
  // console.log(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
  if (
    !GOOGLE_CLIENT_ID ||
    !GOOGLE_CLIENT_SECRET 
  ) {
    throw new Error(
      'Missing environment variables for authentication providers', 
    );
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/auth/google/callback',
      },
      async function (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: (error: any, user?: any) => void,
      ) {
        const user = await db.user.upsert({
          create: {
            email: profile.emails[0].value,
            name: profile.displayName,
          },
          update: {
            name: profile.displayName,
          },
          where: {
            email: profile.emails[0].value,
          },
        });

        done(null, user);
      },
    ),
  );

passport.serializeUser(function (user: any, cb) {
  process.nextTick(function () {
    return cb(null, user.id); // Only store the ID
  });
});

passport.deserializeUser(async function (id: string, cb) {
  try {
    // Actually fetch the user from database using the ID
    const user = await db.user.findUnique({ 
      where: { id } 
    });
    
    if (user) {
      return cb(null, {
        id: user.id,
        name: user.name,
        email: user.email,
        // Add other fields you need
      });
    } else {
      return cb(null, false);
    }
  } catch (error) {
    return cb(error, null);
  }
})}