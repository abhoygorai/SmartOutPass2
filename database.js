const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/outpassDB");
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
    name: "Ayush buttan",
    uidData: "21BCS8888",
    mobileNo: "1234123422",
    gurdianNo: "97322065400",
    hostelDetails:{
        hostelName: "NCT1",
        roomNo: 815
    }
});

// student1.save();

const guardSchema = new mongoose.Schema({
    name: String,
    uidData: String,
    mobileNo: String,
    gurdianNo: String,
    hostelDetails:{
        hostelName: String,
        roomNo: Number
    },
    place: String,
    date: String,
    time: String,
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
    time: "12-05"
});

student11.save();

