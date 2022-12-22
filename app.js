// all the requiring
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require('dotenv').config();
const bcrypt = require('bcrypt');
const alert = require('alert');

// connecting with the database
mongoose.connect("mongodb://127.0.0.1:27017/outpassDB");

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
    outTime: String,
    outDate: String,
    inTime: String,
    inDate: String,
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
const acceptedPass = new mongoose.model("acceptedPass", guardDataSchema);
const rejectedPass = new mongoose.model("rejectedPass", guardDataSchema);

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
                    res.render("authpage", { authPageTitle: "Warden login", messageText: "Login Error", filledUsername: req.body.username });
                }
                else if (check) {
                    res.render("interface", { interfaceText: "Outpass Generation", interfaceSubText: "Enter UID", messageText: "" });
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
                res.render("interface", { interfaceText: "Outpass Generation", interfaceSubText: "Enter UID", messageText: "No data found" });
            }
            else {
                foundData.name = result.name;
                foundData.uidData = result.uidData;
                foundData.mobileNo = result.mobileNo;
                foundData.mobileNo = result.mobileNo;
                foundData.gurdianNo = result.gurdianNo;
                foundData.hostelDetails.hostelName = result.hostelDetails.hostelName;
                foundData.hostelDetails.roomNo = result.hostelDetails.roomNo;
            }
            // console.log(foundData);
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
                outTime: req.body.outTimeData,
                outDate: req.body.outDateData,
                inTime: req.body.inTimeData,
                inDate: req.body.inDateData,
                warden: req.body.wardenData
            });
            postDataForGuard.save();
            // console.log(postDataForGuard);
            res.render("interface", { interfaceText: "Outpass Generation", interfaceSubText: "Enter UID", messageText: "Outpass created" });
        }
        else {
            res.render("interface", { interfaceText: "Outpass Generation", interfaceSubText: "Enter UID", messageText: "Outpass already created" });
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
                    res.render("interface2", { interfaceText: "Outpass Verrification", interfaceSubText: "Enter UID", messageText: "" });
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
            res.render("interface2", { interfaceText: "Outpass Verrification", interfaceSubText: "Enter UID", messageText: "Backend error" });
        }
        else if (result == null) {
            res.render("interface2", { interfaceText: "Outpass Verrification", interfaceSubText: "Enter UID", messageText: "No data found" });
        }
        else {
            res.render("result2", { studentName: result.name, uidData: result.uidData, mobileNo: result.mobileNo, gurdianNo: result.gurdianNo, purposeData: result.purpose, placeData: result.place, outDateData: result.outDate, outTimeData: result.outTime, inTimeData: result.inTime, inDateData: result.inDate, hostelName: result.hostelDetails.hostelName + " [" + result.warden + "]", roomNo: result.hostelDetails.roomNo, wardenData: result.warden });
        }
    });
})

// post request in guardresult to approove or reject the pass
app.post("/guardResult", function (req, res) {
    acceptedPass.findOne({ uidData: req.body.uidData.toUpperCase() }, function (err, result) {
        if (err) {
            console.log(err);
            res.render("interface2", { interfaceText: "Outpass Verrification", interfaceSubText: "Enter UID", messageText: "Backend error" });
        }
        else if (result == null) {
            if (req.body.button == "success") {
                const generatedFinalPass = new acceptedPass({
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
                        roomNo: req.body.roomNo
                    },
                    warden: req.body.wardenData
                });
                generatedFinalPass.save();
                res.render("interface2", { interfaceText: "Outpass Verrification", interfaceSubText: "Enter UID", messageText: "Verrified" });

            }
            else if (req.body.button == "failure") {
                const generatedFinalPass = new rejectedPass({
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
                        roomNo: req.body.roomNo
                    },
                    warden: req.body.wardenData
                });
                generatedFinalPass.save();
                res.render("interface2", { interfaceText: "Outpass Verrification", interfaceSubText: "Enter UID", messageText: "Rejected" });
            }
        }
        else {
            res.render("interface2", { interfaceText: "Outpass Verrification", interfaceSubText: "Enter UID", messageText: "Already Verrified" });
        }
    })

})

// message page for quick messages
app.post("/message", function (req, res) {
    const link = req.body.nextLink;
    res.redirect(link);
});

app.get("/test", (req, res) =>{
    const allGeneratedPass = [];
    guardData.find({}, (err, details)=>{    
        res.render("outpassList", {list: details});
    })  
});

app.post("/test", (req, res) =>{
    const uidDataForSearch = req.body.uidByButton;
    guardData.findOne({ uidData: uidDataForSearch.toUpperCase() }, function (err, result) {
        res.render("finalDetails", { studentName: result.name, uidData: result.uidData, mobileNo: result.mobileNo, gurdianNo: result.gurdianNo, purposeData: result.purpose, placeData: result.place, outDateData: result.outDate, outTimeData: result.outTime, inTimeData: result.inTime, inDateData: result.inDate, hostelName: result.hostelDetails.hostelName + " [" + result.warden + "]", roomNo: result.hostelDetails.roomNo, wardenData: result.warden });
    });
})

// listen part for the server
app.listen(port, function (req, res) {
    console.log("Server started at port" + port);
});