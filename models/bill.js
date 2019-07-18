var mongoose = require("mongoose");

var billSchema = new mongoose.Schema({
    data: [{
        stock: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Stock"
        },
        price_when_sell:Number,
        totals: {
            type: Number,
            default: 1
        }
    }],
    created_at: {
        type: Date,
        default: Date.now
    },
    sale: Number,
    totals_money: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("Bill", billSchema);