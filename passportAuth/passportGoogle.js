const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
module.exports = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:"http://fourpnews.onrender.com/account/signIn/googleAuth/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log(accessToken);
      console.log(refreshToken);
      let user = await User.findOne({ googleId: profile.id }).exec();
      if (!user) {
        user = await User.findOne({ email: profile.emails[0].value }).exec();
        if (user) {
          user.googleId = profile.id;
          await user.save();
        } else {
          const email = profile.emails[0].value;
          const username = email.split('@')[0]; // Generate username from email
          user = await User.create({
            googleId: profile.id,
            email: email,
            fullName: profile.displayName,
            username: username // Set username
          });
        }
      } else {
        done(null, user);
      }
      done(null, user);
    } catch (error) {
      console.log(error);
      done(error);
    }
  }
);
