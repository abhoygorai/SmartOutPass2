const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/outpassDB");
const outpassSchema = new mongoose.Schema({
    name: String,
    uidData: String,
    mobileNo: String,
    gurdianNo: String,
    hostelDetails:{
        hostelName: String,
        roomNo: Number
    }
});

const hostelData = new mongoose.model("HostelData", outpassSchema);

const student1 = new hostelData({
    name: "aditya bobola",
    uidData: "21BCS8888",
    mobileNo: "6295439332",
    gurdianNo: "97322065400",
    hostelDetails:{
        hostelName: "NCT1",
        roomNo: 815
    }
});

student1.save();

const guardSchema = new mongoose.Schema({
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
    inTime: String,
    outTime: String,
    date: String,
    warden: String
})

const guardData = new mongoose.model("guardData", guardSchema);

const student11 = new guardData({
    name: "Abhoy Gorai",
    uidData: "21BCG1063",
    mobileNo: "6295439332",
    gurdianNo: "97322065400",
    hostelDetails:{
        hostelName: "NCT1",
        roomNo: 815
    },
    place: "Home",
    date: "2022-05-07",
    inTime: "12-05"
});

// student11.save();

