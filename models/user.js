const mongoose = require('mongoose');
const { Schema } = mongoose; // Correct way to destructure Schema
const passportLocalMongoose = require('passport-local-mongoose');
const userSchema = new Schema({
    googleId: {
        type: String,
        default: null // Optional: Helps handle cases where Google ID is not provided
    },
    githubId: {
        type: String,
        default: null // Optional: Helps handle cases where GitHub ID is not provided
    },
    fullName: {
        type: String,
        required: [true, "Name is required"] // Added custom error message
    },
    penName: {
        type: String,
        default: null, // Optional: Useful if not every user has a pen name
    },
    email: {
        type: String,
        required: [true, "Email is required"], // Added custom error message
        unique: true // Ensure email is unique
    },
    dateOfBirth: {
        type: Date,
        validate: {
            validator: function(value) {
                const today = new Date();
                const age = today.getFullYear() - value.getFullYear();
                const monthDifference = today.getMonth() - value.getMonth();
                const dayDifference = today.getDate() - value.getDate();

                if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
                    return age - 1 >= 14;
                }

                return age >= 14; // Users must be at least 14 years old
            },
            message: "User must be at least 14 years old"
        }
    },
    role: {
        type: String,
        required: true,
        enum: ["admin", "editor", "writer", "user"],
        default: "user"
    },
    premium: {
        type: Date,
        default: null
    },
    gender: {
        type: String,
        enum: ["female","male"],
        default: "male"
    },
    phoneNumber: {
        type: String, 
    },
    address: {
        type:String,
    },
    profilePic: 
    { 
        url: {
        type: String
        },
        filename: {
        type: String
        }
    },
    bio : {
        type: String,
    },
    managedSubCate: {
        type: Schema.Types.ObjectId,
        ref:'SubCategory'
    }
}, {
    timestamps: true // Automatically add `createdAt` and `updatedAt` fields
});


//This will implmement username and password for them
userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userSchema);
