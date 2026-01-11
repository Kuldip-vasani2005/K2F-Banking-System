// Backend/src/models/identity.model.js
const mongoose = require("mongoose");

const identitySchema = new mongoose.Schema({
    aadhaarNumber: String,
    panNumber: String,
    fullName: String
});

module.exports = mongoose.model("Identity", identitySchema);
