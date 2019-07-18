var mongoose = require("mongoose");

var temp_stocks_in_Schema = new mongoose.Schema({
    name:String,
    totals:Number,
    material:String,
    import_price:Number,
    sell_price:Number,
    image:String,
    description:String
});


module.exports = mongoose.model("temp_stocks_in",temp_stocks_in_Schema);