const mongoose = require("mongoose")


const hostelDataSchema = mongoose.Schema({
    name: String,
    uidData: String,
    mobileNo: String,
    gurdianNo: String,
    hostelDetails: {
        hostelName: String,
        roomNo: Number,
    },
})

const guardDataSchema = mongoose.Schema({
    name: String,
    uidData: String,
    mobileNo: String,
    gurdianNo: String,
    hostelDetails: {
        hostelName: String,
        roomNo: Number,
    },
    purpose: String,
    place: String,
    outTime: String,
    outDate: String,
    inTime: String,
    inDate: String,
    warden: String,
});

const hostelAuthenticationData = new mongoose.model("hostelAuthentication", {
    username: String,
    name: String,
    eid: String,
    hashPassword: String,
});
const guardAuthenticationData = new mongoose.model("guardAuthentication", {
    username: String,
    name: String,
    eid: String,
    hashPassword: String,
});

const hostelData = new mongoose.model("HostelData", hostelDataSchema);
const guardData = new mongoose.model("guardData", guardDataSchema);
const acceptedPass = new mongoose.model("acceptedPass", guardDataSchema);
const rejectedPass = new mongoose.model("rejectedPass", guardDataSchema);

module.exports =  {hostelAuthenticationData, guardAuthenticationData, hostelData, guardData, acceptedPass, rejectedPass}