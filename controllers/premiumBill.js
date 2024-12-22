const PremiumBill = require('../models/premiumBill');
module.exports.isAvailable = async (req, res) => {
    let isAvailable = true; 
    const premiumBill = await PremiumBill.findOne({ buyerId: req.query.buyerId, status: 'wait' });
    if (premiumBill) {
        isAvailable = premiumBill.status !== 'wait'; // Use '=' to assign the value
    }
    res.json(isAvailable);
};
