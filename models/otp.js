const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const otpSchema = new Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true 
    },
    otp: { 
        type: String, 
        required: true 
    },
    expiresAt: { 
        type: Date, 
        required: true 
    }, // when the OTP will expire
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
});

// Ensure that a user can have only one OTP that is valid at a time
otpSchema.index({ userId: 1, expiresAt: 1 }, { unique: true });

module.exports = mongoose.model('OTP', otpSchema);
