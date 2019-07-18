var mongoose = require("mongoose");

var tempbillSchema = new mongoose.Schema({
    name:String,
    totals:Number,
    material:String,
    import_price:Number,
    sell_price:Number,
    image:String,
    created_at:{
        type:Date,
        default:Date.now
    },
    description:String,
    sell_totals:{
        type:Number,
        default:1
    }
});

module.exports = mongoose.model("TempBill",tempbillSchema);