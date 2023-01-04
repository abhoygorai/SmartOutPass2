// all the requiring
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser")
const bcrypt = require("bcrypt");
const models = require("./db/models")
const url = require("url");
const jwt = require("jsonwebtoken")
require("dotenv").config();

// connecting with the database
mongoose.connect("mongodb://127.0.0.1:27017/outpassDB");


const port = 3000;

// creation of the app, setting up body parser, render engine, static folder
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(cookieParser())

// get request at the root
app.get("/", function (req, res) {
    res.render("firstPage");
});

//this is a just a single comment I am making a snap and doing nothing
// post request at the root
app.post("/", function (req, res) {
    if (req.body.buttonData == "hostel") res.redirect("/hostel/");

    if (req.body.buttonData == "guard") res.redirect("/guard");
});

app.get("/hostel", (req, res) => {
    cookieValue = req.cookies.wardenck;
    if (cookieValue == undefined){
        res.redirect("/hostel/login")
    }
    else{

    }
})

// get request in hostel route for loading hostel authorization page

app.get("/hostel/login", function (req, res) {
    console.log(req.query.messageText);
    res.render("authpage", {
        authPageTitle: "Warden login",
        messageText: req.query.messageText,
        filledUsername: req.query.filledUsername,
    });
});

// post request in hostel authentication page to check in the existing database of hostel wardens
app.post("/hostel/login", function (req, res) {
    models.hostelAuthenticationData.findOne({ username: req.body.username }, function (err, result) {
        if (err) {
            console.log(err);
        } else if (result == null) {
            res.redirect(url.format({
                pathname: "/hostel/login",
                query: {
                    "messageText": "No data found",
                    "filledUsername": ""
                }
            }));
        } else {
            bcrypt.compare(req.body.password, result.hashPassword, function (err, check) {
                if (err) {
                    console.log(err);
                    res.redirect(url.format({
                        pathname: "/hostel/login",
                        query: {
                            "messageText": "Login Error",
                            "filledUsername": ""
                        }
                    }));
                } else if (check) {
                    
                    const token = jwt.sign({ 
                        username: req.body.username,
                    }, "outpasssystem");

                    const cookieValue = {
                        username: req.body.username,
                        name: result.name,
                        eid: result.eid,
                        token: token
                    }
                    
                    res.cookie("wardenck", cookieValue, {
                        maxAge: 1000 * 60 * 10,
                        httpOnly: false
                    });

                    res.render("interface", {
                        messageText: ""
                    });
                } else {
                    res.redirect(url.format({
                        pathname: "/hostel/login",
                        query: {
                            "messageText": "Wrong Password",
                            "filledUsername": req.body.username
                        }
                    }));
                }
            });
        }
    }
    );
});


// post request at the hostel for searching in existing database for displaying essential details.
app.post("/hostel/interface", function (req, res) {
    const dataCameFromPost = req.body.uidData;
    // console.log(dataCameFromPost);
    models.hostelData.findOne({ uidData: dataCameFromPost.toUpperCase() }, function (err, result) {
        if (err) console.log(err);
        else {
            if (result == null) {
                res.render("interface", {
                    messageText: "No data found"
                });
            } else {
                res.render("hostelResult", {
                    studentName: result.name,
                    uidData: result.uidData,
                    mobileNo: result.mobileNo,
                    gurdianNo: result.gurdianNo,
                    hostelName: result.hostelDetails.hostelName,
                    roomNo: result.hostelDetails.roomNo,
                }
                );
            }
        }
    }
    );
});

//post request for searching in next database to check that outpass is existing or not, if not then create one.
app.post("/hostelresult", function (req, res) {
    const uidDataForSearch = req.body.uidData;

    // console.log(uidData);
    models.guardData.findOne({ uidData: uidDataForSearch.toUpperCase() }, function (err, result) {
        if (err) {
            console.log(err);
        } else if (result == null) {
            const postDataForGuard = new models.guardData({
                name: req.body.nameData,
                uidData: uidDataForSearch,
                mobileNo: req.body.mobileNo,
                gurdianNo: req.body.gurdianNo,
                hostelDetails: {
                    hostelName: req.body.hostelName,
                    roomNo: req.body.roomNo,
                },
                purpose: req.body.purposeData,
                place: req.body.placeData,
                outTime: req.body.outTimeData,
                outDate: req.body.outDateData,
                inTime: req.body.inTimeData,
                inDate: req.body.inDateData,
                warden: req.body.wardenData,
            });
            postDataForGuard.save();
            // console.log(postDataForGuard);
            res.render("interface", {
                messageText: "Outpass created"
            });
        } else {
            res.render("interface", {
                messageText: "Outpass already exist"
            });
        }
    }
    );
});


app.post("/features", (req, res) => {
    const buttonData = req.body.button;
    // console.log(buttonData);
    if (buttonData == "genpass") {
        models.guardData.find({}, (err, details) => {
            if (err) {
                console.log(err);
                res.render("interface", {
                    messageText: "Error"
                });
            } else res.render("outpassList", { list: details });
        });
    } else if (buttonData == "verpass") {
        models.acceptedPass.find({}, (err, details) => {
            if (err) {
                console.log(err);
                res.render("interface", {
                    messageText: "Error"
                });
            } else res.render("outpassList", { list: details });
        });
    } else if (buttonData == "logout") {
        res.redirect("/hostelauth");
    }
});

app.post("/features/generatedpass", (req, res) => {
    const uidDataForSearch = req.body.uidByButton;
    models.guardData.findOne(
        { uidData: uidDataForSearch.toUpperCase() },
        function (err, result) {
            res.render("finalDetails", {
                studentName: result.name,
                uidData: result.uidData,
                mobileNo: result.mobileNo,
                gurdianNo: result.gurdianNo,
                purposeData: result.purpose,
                placeData: result.place,
                outDateData: result.outDate,
                outTimeData: result.outTime,
                inTimeData: result.inTime,
                inDateData: result.inDate,
                hostelName:
                    result.hostelDetails.hostelName + " [" + result.warden + "]",
                roomNo: result.hostelDetails.roomNo,
                wardenData: result.warden,
            });
        }
    );
});

app.post("/features/verrifiedpass", (req, res) => {
    const uidDataForSearch = req.body.uidByButton;
    models.acceptedPass.findOne(
        { uidData: uidDataForSearch.toUpperCase() },
        function (err, result) {
            res.render("finalDetails", {
                studentName: result.name,
                uidData: result.uidData,
                mobileNo: result.mobileNo,
                gurdianNo: result.gurdianNo,
                purposeData: result.purpose,
                placeData: result.place,
                outDateData: result.outDate,
                outTimeData: result.outTime,
                inTimeData: result.inTime,
                inDateData: result.inDate,
                hostelName:
                    result.hostelDetails.hostelName + " [" + result.warden + "]",
                roomNo: result.hostelDetails.roomNo,
                wardenData: result.warden,
            });
        }
    );
});

app.get("/guard", (req, res) => {
    if (true) {  //check for  logged in or not
        res.redirect("/guard/login");
    }
})

//get request in guard authorization page for logging in the guard
app.get("/guard/login", function (req, res) {
    res.render("authpage2", {
        messageText: req.query.messageText,
        filledUsername: "",
    });
});

// post request for logging in of the guards
app.post("/guard/login", function (req, res) {
    models.guardAuthenticationData.findOne({ username: req.body.username }, function (err, result) {
        if (err) {
            console.log(err);
            res.redirect(url.format({
                pathname: "/guard/login",
                query: {
                    "messageText": "Error Occured",
                }
            }));
        } else if (result == null) {
            res.redirect(url.format({
                pathname: "/guard/login",
                query: {
                    "messageText": "No data found",
                }
            }));
        } else {
            bcrypt.compare(req.body.password, result.hashPassword,
                function (err, check) {
                    if (err) {
                        console.log(err);
                        res.redirect(url.format({
                            pathname: "/guard/login",
                            query: {
                                "messageText": "Error Occured",
                            }
                        }));
                    } else if (check) {
                        res.render("interface2", {
                            messageText: ""
                        });
                    } else {
                        res.redirect(url.format({
                            pathname: "/guard/login",
                            query: {
                                "messageText": "Wrong Password",
                            }
                        }));
                    }
                }
            );
        }
    }
    );
});

// post request to search in the database to check if the pass is generated or not
app.post("/guard/interface", function (req, res) {
    const uidDataForSearch = req.body.uidData;
    models.guardData.findOne({ uidData: uidDataForSearch.toUpperCase() }, function (err, result) {
        if (err) {
            console.log(err);
            res.render("interface2", {
                messageText: "Backend error",
            });
        } else if (result == null) {
            res.render("interface2", {
                messageText: "No data found",
            });
        } else {
            res.render("result2", {
                studentName: result.name,
                uidData: result.uidData,
                mobileNo: result.mobileNo,
                gurdianNo: result.gurdianNo,
                purposeData: result.purpose,
                placeData: result.place,
                outDateData: result.outDate,
                outTimeData: result.outTime,
                inTimeData: result.inTime,
                inDateData: result.inDate,
                hostelName:
                    result.hostelDetails.hostelName + " [" + result.warden + "]",
                roomNo: result.hostelDetails.roomNo,
                wardenData: result.warden,
            });
        }
    }
    );
});

// post request in guardresult to approove or reject the pass
app.post("/guardResult", function (req, res) {
    models.acceptedPass.findOne({ uidData: req.body.uidData.toUpperCase() }, function (err, result) {
        if (err) {
            console.log(err);
            res.render("interface2", {
                messageText: "Backend error",
            });
        } else if (result == null) {
            if (req.body.button == "success") {
                const generatedFinalPass = new models.acceptedPass({
                    name: req.body.nameData,
                    uidData: req.body.uidData,
                    mobileNo: req.body.mobileNo,
                    gurdianNo: req.body.gurdianNo,
                    purpose: req.body.purposeData,
                    place: req.body.placeData,
                    outTime: req.body.outTimeData,
                    inTime: req.body.inTimeData,
                    outDate: req.body.outDateData,
                    inDate: req.body.inDateData,
                    hostelDetails: {
                        hostelName: req.body.hostelName,
                        roomNo: req.body.roomNo,
                    },
                    warden: req.body.wardenData,
                });
                generatedFinalPass.save();
                res.render("interface2", {
                    messageText: "Verrified",
                });
            } else if (req.body.button == "failure") {
                const generatedFinalPass = new models.rejectedPass({
                    name: req.body.nameData,
                    uidData: req.body.uidData,
                    mobileNo: req.body.mobileNo,
                    gurdianNo: req.body.gurdianNo,
                    purpose: req.body.purposeData,
                    place: req.body.placeData,
                    outTime: req.body.outTimeData,
                    inTime: req.body.inTimeData,
                    outDate: req.body.outDateData,
                    inDate: req.body.inDateData,
                    hostelDetails: {
                        hostelName: req.body.hostelName,
                        roomNo: req.body.roomNo,
                    },
                    warden: req.body.wardenData,
                });
                generatedFinalPass.save();
                res.render("interface2", {
                    messageText: "Rejected",
                });
            }
        } else {
            res.render("interface2", {
                messageText: "Already Verrified",
            });
        }
    }
    );
});

// message page for quick messages
app.post("/message", function (req, res) {
    const link = req.body.nextLink;
    res.redirect(link);
});



// listen part for the server
app.listen(port, function (req, res) {
    console.log("Server started at port" + port);
});
