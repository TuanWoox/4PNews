const User = require('../models/user');
const OTP = require('../models/otp');
const sendMail = require('../nodemailer/transporter');
module.exports.renderSignInForm = (req,res) => {
    res.render('account/signIn',{
        layout: 'account',
        title: 'Sign In',
    }
)
}
module.exports.logIn = async (req,res) => {
    req.flash('success', 'Đăng nhập thành công');
    const redirectUrl = res.locals.returnTo || '/';
    if (req.session.returnTo) {
        delete req.session.returnTo;
    }
    res.locals.returnTo = '';
    res.redirect(redirectUrl);
}
module.exports.renderSignUpForm = (req,res) => {
    res.render('account/signUp',{
        layout: 'account',
        title: 'Sign Up',
    }
)
}
module.exports.createLocalUser = async (req,res,next) => {
    const {username,rawPassword,fullName,rawDob,email,gender} = req.body.user;
    // Convert to formated date : Y/M/D
    const dobParts = rawDob.split('/'); 
    const formattedDob = `${dobParts[2]}-${dobParts[1]}-${dobParts[0]}`;
    const dateOfBirthConvert = new Date(formattedDob);
    const user = new User({
        username,
        fullName,
        dateOfBirth: dateOfBirthConvert,
        email,
        gender
    });
    const registeredUser = await User.register(user,rawPassword);
    console.log(registeredUser);
    req.login(registeredUser, err => {
        if(err) return next(err)
        req.flash('success',"Bạn đã đăng kí thành công")
        return res.redirect('/');
    })
}
module.exports.logOut = (req,res,next)=> {
    req.logOut(function(err) {
        if(err){
            return next(err);
        }
    })
    req.flash('error', "Bạn đã đăng xuất")
    res.redirect('/');
}
module.exports.renderChangePasswordForm = (req,res) => {
    res.render('account/changePassword',{
        layout: 'account',
        title: 'Change Password',
    })
}
module.exports.changePassword = async (req,res) => {
    const user = await User.findById(req.user._id);
    await user.changePassword(req.body.user.rawOldPassword, req.body.user.rawNewPassword, err => {
        if(err){
            req.flash('error', 'Mật khẩu cũ không chính xác')
            res.redirect('/account/changePassword')
        } else {
            req.flash('success', "Thay đổi mật khẩu thành công!")
            res.redirect(`/user/${req.user._id}/profile`);
        }
    })
}
module.exports.renderForgetPasswordForm = (req,res) => {
    res.render('account/forgetPassword',{
        layout: 'account',
        title: 'Forget password',
    })
}
module.exports.sendOTP = async (req, res) => {
    const email = req.body.user.email;
    const user = await User.findOne({email: email});
    if(user && user.username)
    {
        const userId = user._id;
        // Check if the user already has an OTP and if it's still valid
        const existingOtp = await OTP.findOne({ userId });

        if (existingOtp) {
            // OTP exists for the user
            if (existingOtp.expiresAt > Date.now()) {
                // OTP is still valid, return a message
                req.flash('error', 'Bạn đã có mã OTP, xin vui lòng kiểm tra mail')
                return res.redirect('/account/resetPassword');
            } 
        }
        // Generate a new OTP
        let otp;
        let isAvailable = false;
        while (!isAvailable) {
            otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP

            // Check if the OTP is unique (not already in use)
            const foundOtp = await OTP.findOne({ otp });
            if (foundOtp && foundOtp.expiresAt > Date.now()) {
                continue;
            } else {
                isAvailable = true;
            }
        }
        // Create the OTP document
        const otpDocument = new OTP({
            otp,
            userId,
            expiresAt: Date.now() + 2 * 60 * 1000 // OTP expires in 2 minutes
        });
        await otpDocument.save(); // Save OTP to the database
        await sendMail(email,otpDocument.otp);
        req.flash('success', 'Mã OTP đã được gửi, xin vui lòng kiểm tra mail')
        return res.redirect('/account/resetPassword');
    } 
    req.flash('error','Bạn chưa đăng kí tải khoản này trong trang chúng tôi, hoặc bạn đăng nhập qua google hoặc github')
    return res.redirect('/account/forgetPassword');
};
module.exports.renderResetPasswordForm = async (req,res) => {
    res.render('account/resetPassword',{
        layout: 'account',
        title: 'Reset password',
    })
}
module.exports.resetPassword = async (req, res) => {
    const { userOTP, rawNewPassword } = req.body.user;
    const foundOTP = await OTP.findOne({ otp: userOTP });
    if (foundOTP) {
        // Check if OTP has expired
        if (foundOTP.expiresAt > Date.now()) {
            const user = await User.findById(foundOTP.userId);
            await user.setPassword(rawNewPassword, async (err,newPasswordUser) => {
                if (err) {
                    req.flash('error', 'Gặp lỗi trong quá trình đặt lại mật khẩu')
                    return res.redirect('/account/resetPassword');

                }  else {
                    await newPasswordUser.save();
                    await OTP.findByIdAndDelete(foundOTP._id);
                    req.flash('success', 'Đặt lại mật khẩu thành công')
                    return res.redirect('/account/signIn');
                }
            });
        } else {
            await OTP.findByIdAndDelete(foundOTP._id);
            req.flash('error', 'Mã OTP đã hết hạn, xin vui lòng gửi lại')
            return res.redirect('/account/forgetPassword');
        }
    } else {
        req.flash('error', 'Mã OTP không hợp lệ')
        return res.redirect('/account/resetPassword');
    }
    
};

module.exports.isAccountAvailable = async (req,res) => {
    const {username } = req.query;
    const user = await User.findOne({username: username});
    console.log(user);
    if(user)
    {
        return res.json(false);
    } else return res.json(true);
}
module.exports.isEmailAvailable = async (req,res) => {
    const {email} = req.query;
    const user = await User.findOne({email: email});
    if(user)
    {
        return res.json(false);
    } else return res.json(true);
}