const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const premiumBill = new Schema({
    buyerId: { 
        type: Schema.Types.ObjectId,
        ref: 'User', 
        required: true 
    },
    status: {
        type: String,
        enum: ['wait', 'rejected','approved'],
        default: 'wait'
    },
},
 {timestamps: true}
);



module.exports = mongoose.model('PremiumBill', premiumBill);
