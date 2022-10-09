// all the requiring
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require('dotenv').config();
const bcrypt = require('bcrypt');
const alert = require('alert');

// connecting with the database
mongoose.connect("mongodb://localhost:27017/outpassDB");

// mongoose schema for hostel database 
const hostelData = new mongoose.model("HostelData", {
    name: String,
    uidData: String,
    mobileNo: String,
    gurdianNo: String,
    hostelDetails: {
        hostelName: String,
        roomNo: Number
    }
});

// mongoose schema for data base of guard portal
const guardDataSchema = mongoose.Schema({
    name: String,
    uidData: String,
    mobileNo: String,
    gurdianNo: String,
    hostelDetails: {
        hostelName: String,
        roomNo: Number
    },
    purpose: String,
    place: String,
    time: String,
    date: String,
    warden: String
});

const guardData = new mongoose.model("guardData", guardDataSchema);

// object for the found data while searching in the data base
let foundData = {
    name: "",
    uidData: "",
    mobileNo: "",
    gurdianNo: "",
    hostelDetails: {
        hostelName: "",
        roomNo: 0
    }
};

// mongoose model for for hostel and guard data 
const hostelAuthenticationData = new mongoose.model("hostelAuthentication", {
    username: String,
    hashPassword: String
});
const guardAuthenticationData = new mongoose.model("guardAuthentication", {
    username: String,
    hashPassword: String
});
const finalPass = new mongoose.model("finalPass", guardDataSchema);

const port = 3000;

// creation of the app, setting up body parser, render engine, static folder 
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// get request at the root
app.get("/", function (req, res) {
    res.render("firstPage");
});

//this is a just a single comment I am making a snap and doing nothing
// post request at the root
app.post("/", function (req, res) {
    if (req.body.buttonData == "hostel")
        res.redirect("/hostelauth");

    if (req.body.buttonData == "guard")
        res.redirect("/guardauth");
});

// get request in hostel route for loading hostel authorization page

app.get("/hostelauth", function (req, res) {
    res.render("authpage", { authPageTitle: "Warden login", messageText: "", filledUsername: "" });
});

// post request in hostel authentication page to check in the existing database of hostel wardens
app.post("/hostelauth", function (req, res) {
    hostelAuthenticationData.findOne({ username: req.body.username }, function (err, result) {
        if (err) {
            console.log(err)
        }
        else if (result == null) {
            res.render("authpage", { authPageTitle: "Warden login", messageText: "No data found", filledUsername: "" });

        }
        else {
            bcrypt.compare(req.body.password, result.hashPassword, function (err, check) {
                if (err) {
                    console.log(err);
                    res.render("interface", { interfaceText: "Outpass Generation", interfaceSubText: "Enter UID", messageText: "Login error"});
                }
                else if (check) {
                    res.render("interface", { interfaceText: "Outpass Generation", interfaceSubText: "Enter UID", messageText: ""});
                }
                else {
                    res.render("authpage", { authPageTitle: "Warden login", messageText: "Wrong Password", filledUsername: req.body.username });

                }
            });
        }
    })
});

// post request at the hostel for searching in existing database for displaying essential details.
app.post("/hostel", function (req, res) {
    const dataCameFromPost = req.body.uidData;
    // console.log(dataCameFromPost);
    hostelData.findOne({ uidData: dataCameFromPost.toUpperCase() }, function (err, result) {
        if (err)
            console.log(err);
        else {
            if (result == null) {
                res.render("interface", { interfaceText: "Outpass Generation", interfaceSubText: "Enter UID", messageText: "No data found"});
            }
            else {
                foundData.name = result.name;
                foundData.uidData = result.uidData;
                foundData.mobileNo = result.mobileNo;
                foundData.mobileNo = result.mobileNo;
                foundData.gurdianNo = result.gurdianNo;
                foundData.hostelDetails = result.hostelDetails;
            }
            console.log(foundData.name);
            res.render("hostelResult", { studentName: foundData.name, uidData: foundData.uidData, mobileNo: foundData.mobileNo, gurdianNo: foundData.gurdianNo, hostelName: foundData.hostelDetails.hostelName, roomNo: foundData.hostelDetails.roomNo });
        }
    });
});

//post request for searching in next database to check that outpass is existing or not, if not then create one.
app.post("/hostelresult", function (req, res) {
    const uidDataForSearch = req.body.uidData;

    // console.log(uidData);
    guardData.findOne({ uidData: uidDataForSearch.toUpperCase() }, function (err, result) {
        if (err) {
            console.log(err);
        }
        else if (result == null) {
            const postDataForGuard = new guardData({
                name: req.body.nameData,
                uidData: uidDataForSearch,
                mobileNo: req.body.mobileNo,
                gurdianNo: req.body.gurdianNo,
                hostelDetails: {
                    hostelName: req.body.hostelName,
                    roomNo: req.body.roomNo
                },
                purpose: req.body.purposeData,
                place: req.body.placeData,
                date: req.body.dateData,
                time: req.body.timeData,
                warden: req.body.wardenData
            });
            postDataForGuard.save();
            res.render("interface", { interfaceText: "Outpass Generation", interfaceSubText: "Enter UID", messageText: "Outpass created"});
        }
        else {
            res.render("interface", { interfaceText: "Outpass Generation", interfaceSubText: "Enter UID", messageText: "Outpass already created"});
        }
    });
});

//get request in guard authorization page for logging in the guard
app.get("/guardauth", function (req, res) {
    res.render("authpage2", { authPageTitle: "Guard login", messageText: "", filledUsername: "" });
});

// post request for logging in of the guards
app.post("/guardauth", function (req, res) {
    guardAuthenticationData.findOne({ username: req.body.username }, function (err, result) {
        if (err) {
            console.log(err)
            res.render("authpage2", { authPageTitle: "Guard login", messageText: "Error occured", filledUsername: "" });
        }
        else if (result == null) {
            res.render("authpage2", { authPageTitle: "Guard login", messageText: "No data found", filledUsername: "" });

        }
        else {
            bcrypt.compare(req.body.password, result.hashPassword, function (err, check) {
                if (err) {
                    console.log(err);
                    res.render("authpage2", { authPageTitle: "Guard login", messageText: "Error occured", filledUsername: "" });
                }
                else if (check) {
                    res.render("interface2", { interfaceText: "Outpass Verrification", interfaceSubText: "Enter UID", messageText: ""});
                }
                else {
                    res.render("authpage2", { authPageTitle: "Guard login", messageText: "Wrong password", filledUsername: req.body.username });
                }
            });
        }
    })
})

// post request to search in the database to check if the pass is generated or not
app.post("/guard", function (req, res) {
    const uidDataForSearch = req.body.uidData;
    guardData.findOne({ uidData: uidDataForSearch.toUpperCase() }, function (err, result) {
        if (err) {
            console.log(err);
            res.render("interface2", { interfaceText: "Outpass Verrification", interfaceSubText: "Enter UID", messageText: "Backend error"});
        }
        else if (result == null) {
            res.render("interface2", { interfaceText: "Outpass Verrification", interfaceSubText: "Enter UID", messageText: "No data found"});
        }
        else {
            res.render("result2", { studentName: result.name, uidData: result.uidData, mobileNo: result.mobileNo, gurdianNo: result.gurdianNo, purposeData: result.purpose, placeData: result.place, dateData: result.date, timeData: result.time, hostelName: result.hostelDetails.hostelName+" ["+result.warden+"]", roomNo: result.hostelDetails.roomNo, wardenData: result.warden});
        }
    });
})

// post request in guardresult to approove or reject the pass
app.post("/guardResult", function (req, res) {
    finalPass.findOne({ uidData: req.body.uidData.toUpperCase() }, function (err, result){
        if(err){
            console.log(err);
            res.render("interface2", { interfaceText: "Outpass Verrification", interfaceSubText: "Enter UID", messageText: "Backend error"});
        }
        else if(result == null){
            const generatedFinalPass = new finalPass({
                name: req.body.nameData,
                uidData: req.body.uidData,
                mobileNo: req.body.mobileNo,
                gurdianNo: req.body.gurdianNo,
                purpose: req.body.purposeData,
                place: req.body.placeData,
                time: req.body.timeData,
                date: req.body.dateData,
                hostelDetails: {
                    hostelName: req.body.hostelName,
                    roomNo: req.body.roomNo
                },
                warden: req.body.wardenData
            });
        
            if (req.body.button == "success") {
                generatedFinalPass.save();
                res.render("interface2", { interfaceText: "Outpass Verrification", interfaceSubText: "Enter UID", messageText: "Verrified"});
                
            }
            else if (req.body.button == "failure") {
                res.render("interface2", { interfaceText: "Outpass Verrification", interfaceSubText: "Enter UID", messageText: "Rejected"});
            }
        }
        else{
            res.render("interface2", { interfaceText: "Outpass Verrification", interfaceSubText: "Enter UID", messageText: "Already Verrified"});
        }
    })
    
})

// message page for quick messages
app.post("/message", function (req, res) {
    const link = req.body.nextLink;
    res.redirect(link);
});


// listen part for the server
app.listen(port, function (req, res) {
    console.log("Server started at port" + port);
});