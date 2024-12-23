const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/user');
module.exports = new GitHubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: '/account/signIn/githubAuth/callback',
    scope: ['user:email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if a user with this GitHub ID already exists
      let user = await User.findOne({ githubId: profile.id }).exec();
      if (!user) {
        // Check if a user with the same email already exists
        user = await User.findOne({ email: profile.emails[0].value }).exec();
        if (user) {
          // If a user exists, link their GitHub ID and save
          user.githubId = profile.id;
          await user.save();
        } else {
          // If not, create a new user
          user = await User.create({
            githubId: profile.id,
            email: profile.emails[0].value,
            fullName: profile.displayName || profile.username,
          });
        }
      }
      // Pass the user to Passport
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
);
