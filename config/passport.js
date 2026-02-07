import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import User from "../models/User.js"

const hasGoogle =
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET

if (hasGoogle) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ email: profile.emails[0].value })

          if (!user) {
            user = await User.create({
              name: profile.displayName,
              email: profile.emails[0].value.toLowerCase(),
              password: "google-oauth",
              role: "user",
            })
          }

          done(null, user)
        } catch (err) {
          done(err, null)
        }
      }
    )
  )
} else {
  console.log("⚠️ Google OAuth disabled (env vars missing)")
}

passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id)
  done(null, user)
})

export default passport
