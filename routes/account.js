const express = require('express');
const router = express.Router({mergeParams: true});
const accountController = require('../controllers/account');
const passport = require('passport');
const { storeReturnTo, isLoggedIn} = require('../middlewares/checkMiddleware');

router.route('/signIn')
  .get(accountController.renderSignInForm)
  .post(
    storeReturnTo,
    passport.authenticate('local', { 
      failureFlash: 'Không thể đăng nhập, kiểm tra tài khoản và mật khẩu',
      failureRedirect: '/account/signIn' 
    }),
    accountController.logIn
);

router.route('/signIn/googleAuth')
.get(passport.authenticate('google', { scope: ['profile', 'email'] }))

router.route('/signIn/googleAuth/callback')
.get(
    storeReturnTo,
    passport.authenticate('google', { failureRedirect: '/account/signIn' }),
    accountController.logIn
);

router.route('/signIn/githubAuth')
.get(passport.authenticate('github'));

router.route('/signIn/githubAuth/callback')
.get(
    storeReturnTo,
    passport.authenticate('github',{ failureRedirect: '/account/signIn' }),
    accountController.logIn
);

router.route('/signUp')
.get(accountController.renderSignUpForm)
.post(accountController.createLocalUser)

router.route('/forgetPassword')
.get(accountController.renderForgetPasswordForm)
.post(accountController.sendOTP)



router.route('/changePassword')
.get(isLoggedIn,accountController.renderChangePasswordForm)
.patch(isLoggedIn,accountController.changePassword)

router.route('/resetPassword')
.get(accountController.renderResetPasswordForm)
.patch(accountController.resetPassword)


router.route('/logOut')
.get(accountController.logOut)

module.exports = router;