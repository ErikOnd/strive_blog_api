import GoogleStrategy from "passport-google-oauth20";

const googleStrategy = new GoogleStrategy({
  clientID: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL: "http://www.example.com/auth/google/callback",
});
