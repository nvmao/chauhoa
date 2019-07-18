var mongoose = require("mongoose");

var stockSchenma = new mongoose.Schema({
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
});

module.exports = mongoose.model("Stock",stockSchenma);