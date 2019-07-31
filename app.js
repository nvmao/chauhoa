var express = require("express"),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    dateformat = require("dateformat"),
    moment = require('moment'),
    faker = require('faker'),
    app = express(),
    Stock = require("./models/stock"),
    TempStockIn = require("./models/temp_stocks_in"),
    Bill = require("./models/bill"),
    TempBill = require("./models/temp_bill");

mongoose.connect("mongodb+srv://root:rtyfghvb@cluster0-pwvxg.mongodb.net/chauhoa?retryWrites=true&w=majority", {
    useNewUrlParser: true
});

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(methodOverride("_method"));

var search = "";
var searchBy;

app.get("/", function (req, res) {
    res.redirect("/index");
});

app.get("/index", function (req, res) {
    search = "";
    var perPage = 12;
    var page = Math.max(0, 0);

    Stock.find()
        .select()
        .skip(perPage * page)
        .limit(perPage)
        .exec(function (err, stocks) {
            if (err) {
                console.log(err);
            } else {
                res.render("index", {
                    stocks: stocks,
                    dateformat: dateformat,
                    page: page,
                    search_type: 0
                });
            }
        })
});

app.get("/index/page/:page", function (req, res) {
    search = "";
    var perPage = 12;
    var page = Math.max(0, req.params.page);

    Stock.find()
        .select()
        .skip(perPage * page)
        .limit(perPage)
        .exec(function (err, stocks) {
            if (err) {
                console.log(err);
            } else {
                res.render("index", {
                    stocks: stocks,
                    dateformat: dateformat,
                    page: page,
                    search_type: 0
                });
            }
        })

});

app.get("/add", function (req, res) {
    TempStockIn.find({}, function (err, tempStockIn) {
        if (err) {
            console.log(err);
        } else {
            res.render("add", {
                tempStockIn: tempStockIn,
                totals_money_n: 0,
                totals_money_x: 0
            });
        }
    });
});

app.get("/add/add_stock", function (req, res) {
    res.render("add_stock");
});

app.post("/add/add_stock", function (req, res) {
    var new_stock = req.body.stock;
    TempStockIn.create(new_stock, function (err, stock) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/add");
        }
    });
});

app.get("/add/:id/edit_stock", function (req, res) {
    TempStockIn.findById(req.params.id, function (err, stock) {
        if (err) {
            console.log(err);
        } else {
            res.render("edit_stock", {
                stock: stock
            });
        }
    })
});

app.put("/add/:id", function (req, res) {
    TempStockIn.findByIdAndUpdate(req.params.id, req.body.stock, function (err, stock) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/add");
        }
    });
});

app.delete("/add/:id", function (req, res) {
    TempStockIn.findByIdAndDelete(req.params.id, function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/add");
        }
    })
});

app.post("/add", function (req, res) {
    TempStockIn.find({}, function (err, tempStock) {
        if (err) {
            console.log(err);
        } else {
            tempStock.forEach(function (stock) {
                var newStock = {
                    name: stock.name.toLowerCase(),
                    totals: stock.totals,
                    material: stock.material.toLowerCase(),
                    import_price: stock.import_price,
                    sell_price: stock.sell_price,
                    image: stock.image,
                    description: stock.description,
                };
                Stock.create(newStock, function (err, stock) {
                    if (err) {
                        console.log(err);
                    }
                });
            });
            console.log("added " + tempStock.length);
            TempStockIn.deleteMany({}, function (err) {
                if (err) {
                    console.log(err);
                }
                res.redirect("/");
            });
        }
    });
});

app.post("/search", function (req, res) {
    const s = req.body.search;
    search = s
    const by = req.body.searchBy

    if (by === "Tên") {
        searchBy = {
            name: {$regex: `.*${String(search).toLowerCase()}.*`}
        }
    }
    else if(by === "Giá bán"){
        searchBy = {
            sell_price: Number(search)
        }
    }
    else if(by === "Vật liệu"){
        searchBy = {
            material: {$regex: `.*${String(search).toLowerCase()}.*`}
        }
    }
    else if(by === "Vật liệu + Giá bán"){
        var index = search.indexOf(' ')
        var material = search.substr(0,index)
        var price = Number(search.substr(index,search.length-1))
        console.log(material)
        console.log(price)

        searchBy = {
            sell_price: Number(price),
            material: {$regex: `.*${String(material).toLowerCase()}.*`}
        }
    }

    return res.redirect('/search/page/0')

    var perPage = 12;
    var page = Math.max(0, 0);

    Stock.find({
        name: {
            $regex: '.*' + String(s).toLowerCase() + '.*'
        }
    }).skip(page * perPage).limit(perPage).
    exec(function (err, stocks) {
        if (err) {
            console.log(err);
            res.redirect("/index");
        } else {
            console.log(stocks);
            res.render("index", {
                stocks: stocks,
                dateformat: dateformat,
                page: page,
                search_type: 1
            });
        }
    });

});

app.get("/search/page/:page", function (req, res) {
    var perPage = 12;
    var page = Math.max(0, req.params.page);

    Stock.find(
        searchBy).skip(page * perPage).limit(perPage).
    exec(function (err, stocks) {
        if (err) {
            console.log(err);
            res.redirect("/index");
        } else {
            console.log(stocks);
            res.render("index", {
                stocks: stocks,
                dateformat: dateformat,
                page: page,
                search_type: 1
            });
        }
    });

});

app.post("/search/filter/:page", function (req, res) {
    var perPage = 12;
    var page = Math.max(0, req.params.page);

    console.log(req.body);

    var order = 1;
    if (req.body.filter.order == "Giảm dần") {
        order = -1;
    }

    if (req.body.filter.kind == "Tên") {
        Stock.find({
                name: {
                    $regex: '.*' + String(search).toLowerCase() + '.*'
                }
            }).sort({
                name: order
            }).limit(perPage).skip(perPage * page)
            .exec(function (err, stocks) {
                if (err) {
                    console.log(err);
                    res.redirect("/index");
                } else {
                    console.log(stocks);
                    res.render("index", {
                        stocks: stocks,
                        dateformat: dateformat,
                        page: page,
                        search_type: 2,
                        filter: {
                            order: req.body.filter.order,
                            kind: req.body.filter.kind
                        }
                    });
                }
            });
    } else if (req.body.filter.kind == "Ngày nhập") {
        Stock.find({
                name: {
                    $regex: '.*' + String(search).toLowerCase() + '.*'
                }
            }).sort({
                created_at: order
            }).limit(perPage).skip(perPage * page)
            .exec(function (err, stocks) {
                if (err) {
                    console.log(err);
                    res.redirect("/index");
                } else {
                    console.log(stocks);
                    res.render("index", {
                        stocks: stocks,
                        dateformat: dateformat,
                        page: page,
                        search_type: 2,
                        filter: {
                            order: req.body.filter.order,
                            kind: req.body.filter.kind
                        }
                    });
                }
            });
    } else if (req.body.filter.kind == "Số lượng") {
        Stock.find({
                name: {
                    $regex: '.*' + String(search).toLowerCase() + '.*'
                }
            }).sort({
                totals: order
            }).limit(perPage).skip(perPage * page)
            .exec(function (err, stocks) {
                if (err) {
                    console.log(err);
                    res.redirect("/index");
                } else {
                    console.log(stocks);
                    res.render("index", {
                        stocks: stocks,
                        dateformat: dateformat,
                        page: page,
                        search_type: 2,
                        filter: {
                            order: req.body.filter.order,
                            kind: req.body.filter.kind
                        }
                    });
                }
            });
    } else if (req.body.filter.kind == "Giá bán") {
        Stock.find({
                name: {
                    $regex: '.*' + String(search).toLowerCase() + '.*'
                }
            }).sort({
                sell_price: order
            }).limit(perPage).skip(perPage * page)
            .exec(function (err, stocks) {
                if (err) {
                    console.log(err);
                    res.redirect("/index");
                } else {
                    console.log(stocks);
                    res.render("index", {
                        stocks: stocks,
                        dateformat: dateformat,
                        page: page,
                        search_type: 2,
                        filter: {
                            order: req.body.filter.order,
                            kind: req.body.filter.kind
                        }
                    });
                }
            });
    }
});

app.get("/index/:id", function (req, res) {
    Stock.findById(req.params.id, function (err, stock) {
        if (err) {
            console.log(err);
        } else {
            res.render("show", {
                stock: stock,
                dateformat: dateformat
            });
        }
    })
});

app.get("/index/:id/edit", function (req, res) {
    Stock.findById(req.params.id, function (err, stock) {
        if (err) {
            console.log(err);
        } else {
            res.render("edit", {
                stock: stock
            });
        }
    });
});

app.put("/index/:id", function (req, res) {
    Stock.findByIdAndUpdate(req.params.id, req.body.stock, function (err, stock) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/index/" + req.params.id);
        }
    });
});

app.delete("/index/:id", function (req, res) {
    Stock.findByIdAndDelete(req.params.id, function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/");
        }
    });
});

// sell
var sale = 0;
app.get("/sell", function (req, res) {
    TempBill.find({}, function (err, stock) {
        if (err) {
            console.log(err);
        } else {
            res.render("sell", {
                stocks: stock,
                totals_money_x: 0,
                sale: sale
            });
        }
    });
});

app.post("/sell/sale", function (req, res) {
    sale = Number(req.body.sale);
    console.log(sale);
    console.log(req.body.sale);
    res.redirect("/sell");
})

app.post("/sell/add/:id", function (req, res) {
    Stock.findById(req.params.id, function (err, stock) {
        if (err) {
            console.log(err);
        } else {
            TempBill.findById(req.params.id, function (err, found) {
                if (found) {
                    if (found.sell_totals < found.totals) {
                        found.sell_totals++;
                        found.save();
                    }
                    res.redirect("back");
                } else {
                    if (stock.totals == 0) {
                        res.redirect("back");
                    } else {
                        TempBill.create({
                            _id: stock._id,
                            name: stock.name,
                            totals: stock.totals,
                            material: stock.material,
                            import_price: stock.import_price,
                            sell_price: stock.sell_price,
                            image: stock.image,
                            created_at: stock.created_at,
                            description: stock.description,
                        }, function (err, s) {
                            if (err) {
                                console.log(err);
                            } else {
                                res.redirect("back");
                            }
                        });
                    }
                }
            })
        }
    })
});

app.post("/sell/:id/plus", function (req, res) {
    TempBill.findById(req.params.id, function (err, stock) {
        if (err) {
            console.log(err);
        } else {
            if (stock.sell_totals < stock.totals) {
                stock.sell_totals++;
                stock.save();
            }
            res.redirect("/sell");
        }
    });
});

app.post("/sell/:id/minus", function (req, res) {
    TempBill.findById(req.params.id, function (err, stock) {
        if (err) {
            console.log(err);
        } else {
            if (stock.sell_totals > 1) {
                stock.sell_totals--;
                stock.save();
            }
            res.redirect("/sell");
        }
    });
});

app.delete("/sell/:id", function (req, res) {
    TempBill.findByIdAndDelete(req.params.id, function (err) {
        if (err) {
            console.log(err);
        }
        res.redirect("/sell");
    })
});

app.post("/sell", async function (req, res) {
    const count = await TempBill.countDocuments({})
    if (count < 1) {
        return res.redirect("/sell");
    }
    TempBill.find({}, function (err, tempBill) {
        if (err) {
            console.log(err);
        } else {
            Bill.create({
                sale: sale
            }, function (err, bill) {
                if (err) {
                    console.log(err);
                } else {
                    tempBill.forEach(function (s) {
                        Stock.findById(s._id, function (err, mainStock) {
                            mainStock.totals -= s.sell_totals;
                            mainStock.save();
                        })
                        bill.totals_money += (s.sell_totals * s.sell_price);
                        bill.data.push({
                            stock: s._id,
                            price_when_sell: s.sell_price,
                            totals: s.sell_totals
                        });
                    });
                    console.log(bill);
                    bill.save();
                    TempBill.deleteMany({}, function (err) {
                        if (err) {
                            console.log(err);
                        }
                        sale = 0;
                        res.redirect("/sell");
                    });
                }
            });
        }
    });
});
//bill
app.get("/bill", function (req, res) {
    var perPage = 12;
    var page = Math.max(0, 0);
    Bill.find({}).sort({
        created_at: -1
    }).exec(function (err, bills) {
        res.render("bill", {
            bills: bills,
            dateformat: dateformat,
            page: page
        });
    });
});

app.get("/bill/page/:page", function (req, res) {
    var perPage = 10;
    var page = Math.max(0, req.params.page);
    Bill.find({}).skip(perPage * page).limit(perPage).sort({
        created_at: -1
    }).exec(function (err, bills) {
        res.render("bill", {
            bills: bills,
            dateformat: dateformat,
            page: page
        });
    });
});

app.get("/bill/:id", function (req, res) {
    Bill.findById(req.params.id).populate("data.stock").exec(function (err, bill) {
        console.log(bill);
        res.render("show_bill", {
            bill: bill,
            dateformat: dateformat
        });
    })
});

app.get("/statistic", function (req, res) {
    res.render("statistic");
});

app.post("/statistic/show", function (req, res) {
    Bill.find({
        created_at: {
            $gte: moment(req.body.date.from).startOf('day').toDate(),
            $lte: moment(req.body.date.to).endOf('day').toDate()
        }
    }).populate("data.stock").exec(function (err, bills) {
        res.render("show_status", {
            bills: bills
        })
    });
});

app.get("/statistic/show_all", function (req, res) {
    Bill.find({
        created_at: {
            $gte: moment('2019-01-01').startOf('day').toDate(),
            $lte: moment('2050-01-01').endOf('day').toDate()
        }
    }).populate("data.stock").exec(function (err, bills) {
        res.render("show_status_all", {
            bills: bills
        })
    });
});

// for(var i = 0; i < 100;i++){
//     var price = Number(faker.commerce.price());
//         var name         =faker.commerce.productName();
//         var totals       =30;
//         var material     = faker.commerce.productMaterial();
//         var import_price = price;
//         var sell_price   = price*2;
//         var  image       =faker.image.image();
//         var created_at   =faker.date.past();
//         var description  =faker.lorem.paragraphs();
//     var newStock ={
//         name:name,
//         totals:totals,
//         material:material,
//         import_price: import_price,
//         sell_price: sell_price,
//         image:image,
//         created_at:created_at,
//         description:description
//     }
//     Stock.create(newStock);
// }

app.listen(process.env.PORT || 3000, function () {
    console.log("sever running");
});