const News = require('../models/news');
const User = require('../models/user');
module.exports.isLoggedIn = (req,res,next) => {
    //isAuthenticated() is used to check if the cookie for the session is still valid!
    if(!req.isAuthenticated())
        {
            req.session.returnTo = req.originalUrl; 
            req.flash('error','Bạn chưa đăng nhập!!!');
            return res.redirect('/account/signIn');
        }
    next();
}
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}
module.exports.IsYou = (req,res,next) => {
    let isRealUser = req.user._id.toString() === req.params.id
    if(isRealUser === false)
    {
        req.flash('error','Bạn không phải chủ nhân của tài khoản này')
        return res.redirect(`/`)
    } 
    next();
}
module.exports.IsAuthorNews = async (req,res,next) => {
    let news = await News.findById(req.params.newsId);
    if(!news.author.equals(req.user._id))
    {
        req.flash('error','Bạn không phải chủ nhân của bài viết này')
        return res.redirect('/');
    }
    next();
}
module.exports.canWriterEdit = async (req,res,next) => {
    const news = await News.findById(req.params.newsId);
    if(!(news.status === 'draft' || news.status === 'rejected'))
    {
        req.flash('error','Không thể chỉnh sửa bài viết này')
        return res.redirect(`/writer/${req.user._id}/writerNews`);
    }
    next()
}
module.exports.canEdtiorReject = async (req,res,next) => {
    const news = await News.findById(req.params.newsId);
    if(!(news.status === 'draft'))
    {
        req.flash('error','Bài viết này đã bị từ chối')
        return res.redirect(`/editor/${req.user._id}/editorNews`);
    }
    next();
}
module.exports.isAdmin = async (req,res,next) => {
    const user = await User.findById(req.user._id);
    if(user.role !== 'admin')
    {
        req.flash('error','Bạn không phải admin')
        return res.redirect(`/`);
    }
    next();
}
module.exports.premiumNews = async (req,res,next) => {
    const news = await News.findById(req.params.newsId);
    if(news.isPremium)
    {
    if(!req.isAuthenticated())
    {
            req.session.returnTo = req.originalUrl; 
            req.flash('error','Bạn chưa đăng nhập!!!');
            return res.redirect('/account/signIn');
    } else {
        let now = new Date();
        const news = await News.findById(req.params.newsId);
        console.log(news);
        if(req.user.role === "user" && req.user.premium && req.user.premium < now && news.isPremium ) 
        {
                req.session.returnTo = req.originalUrl; 
                req.flash('error','Bạn chưa gia hạn premium');
                return res.redirect('/');
        } 
    }
    }
    next();
}