const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/user');
module.exports = new GitHubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL:"http://fourpnews.onrender.com/account/signIn/githubAuth/callback",
    scope: ['user:email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ githubId: profile.id });
      if (!user) {
        user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
          user.githubId = profile.id;
          await user.save();
        } else {
          const email = profile.emails[0].value;
          const username = email.split('@')[0]; // Generate username from email
          user = await User.create({
            githubId: profile.id,
            email: email,
            fullName: profile.displayName || profile.username,
            username: username // Set username
          });
        }
      } else {
        done(null, user);
      }
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
);
