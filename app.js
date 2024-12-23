//Load from environment
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const {engine} = require('express-handlebars');
const Handlebars=require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const passportGoogle = require('./passportAuth/passportGoogle');
const passportGithub = require('./passportAuth/passportGithub');
const hbs = require('express-handlebars-sections');
const connectFlash = require('connect-flash');
const User = require('./models/user');
const MainCate = require('./models/mainCategory');
const SubCate = require('./models/subCategory');
const dbUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/4PNEWS';
// Initialize Express
const app = express();
const PORT = process.env.PORT || 4444;
// Connect to MongoDB
mongoose.connect(dbUrl)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('Error connecting to MongoDB:', err));


//Set up view engine
app.engine('hbs', engine({
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  extname: 'hbs',
  defaultLayout: 'main',
  helpers: {
    section: hbs(),
    eq(value1,value2) {
      return value1.toString() === value2.toString();
    },
    convertToDisplayDate(value) {
      const date = new Date(value.createdAt).toLocaleDateString('en-GB');  // British English for D/M/Y format
      return date;
    },
    convertToDisplayPublishedDate(value) {
      const date = new Date(value);
      // Format date as D/M/Y and time as H:MM (24-hour format)
      const formattedDate = date.toLocaleDateString('en-GB');  // British English for D/M/Y format
      const formattedTime = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); // Format time as HH:mm
      
      return `${formattedDate} ${formattedTime}`; // Combine date and time
    },    
    isPremiumStillValid(value){
      const now = new Date();
      return value > now;
    },
    convertToDate(value) {
      const date = new Date(value);
      // Format date as D/M/Y and time as H:MM (24-hour format)
      const formattedDate = date.toLocaleDateString('en-GB');  // British English for D/M/Y format
      const formattedTime = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); // Format time as HH:mm
      
      return `${formattedDate} ${formattedTime}`; // Combine date and time
    }, 
    timesince(date) {
      const now = new Date(); // Current date and time
      const parsedDate = new Date(date); // Parse the input date
    
      if (isNaN(parsedDate)) {
        return "Invalid date"; // Handle invalid dates
      }
      const diff = now.getTime() - parsedDate.getTime(); // Difference in milliseconds
    
      if (diff < 0) {
        return "in the future"; // Handle future dates
      }
    
      const minutes = Math.floor(diff / 60000); // Convert to minutes
      if (minutes < 60) {
        return `${minutes} min(s) ago`;
      }
    
      const hours = Math.floor(minutes / 60); // Convert to hours
      if (hours < 24) {
        return `${hours} hour(s) ago`;
      }
    
      const days = Math.floor(hours / 24); // Convert to days
      if(days <= 7) {
        return `${days} day(s) ago`;
      }
      return date = new Date(parsedDate).toLocaleDateString('en-GB');
    },
    gt(value1, value2) {
      if (value1 === undefined || value2 === undefined) {
        return false; // Or handle it differently
      }
      return value1 > value2;
    },
    range(start,end) {
      let range = [];
      for (let i = start; i <= end; i++) {
        range.push(i);
      }
      return range;
    },
    or(v1, v2) {
      return v1 || v2; // Simply returns true if either v1 or v2 is truthy
    },    
    and(v1,v2) {
      return v1 && v2;
    },
    isLessThanDateNow(value)
    {
      const dateNow = new Date();
      return value < dateNow;
    },
    isStillPremiumUser(value){
      const now = new Date();
      return value.role === 'user' && new Date(value) > now;
    },
    add(a,b){
      return a+b;
    },
    subtract(a,b)
    {
      return a-b;
    },
    multiply(a,b) {
      return a*b;
    }
  },
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views') );


// Middleware setup
app.use(express.static(path.join(__dirname, 'public'))); //serve static file
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));
app.use(express.json({limit: '20mb'})); // Parse JSON payloads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(methodOverride('_method')); // Allow method override for PUT and DELETE
app.use(cookieParser()); // Parse cookies
app.use(connectFlash());

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    //7 days to live
    ttl: 7*24*60*60,
    crypto: {
        secret: process.env.CRYPTO_SESSION_SECRET
    }
})
  
store.on("error", function(e) {
    console.log('SESSION ERROR', e)
})
  

  // Session management
app.use(session({
    store,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      name: 'eduSocialCookie',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      //this is for when deploy with https
      //secure: true
    }
}));

  
// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser((user, done) => {
  done(null, user); // Save user 
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id._id);
    done(null, user); // Attach user object to `req.user`
  } catch (err) {
    done(err, null);
  }
});
passport.use('google',passportGoogle);
passport.use('github',passportGithub)

//Routes imports
const generalRoutes = require('./routes/general');
const accountRoutes = require('./routes/account');
const userRoutes = require('./routes/user');
const writerRoutes = require('./routes/writer');
const editorRoutes = require('./routes/editor');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');

//Catch flash message and user!
app.use((req,res,next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentUser = req.user;
  next();
})

app.use( async (req, res, next)=>{
  const allMainCate = await MainCate.find({});
  const mainCateWithSub = await Promise.all(
    allMainCate.map(async (mainCate) => {
      const subcategories = await SubCate.find({ belongTo: mainCate._id });
      return { ...mainCate.toObject(), subcategories };
    })
  );
  res.locals.allCate = mainCateWithSub; // Use res.locals instead of req.locals
  next();
})

//Routes setup
app.use('/account',accountRoutes);
app.use('/user', userRoutes);
app.use('/writer',writerRoutes);
app.use('/editor',editorRoutes);
app.use('/admin', adminRoutes)
app.use('/api', apiRoutes);
app.use('/', generalRoutes);



app.listen(PORT, () => console.log(`Server running on port ${PORT}`))