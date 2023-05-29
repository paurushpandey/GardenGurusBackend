const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true }, // required.
    email: { type: String, unique: true }, // required.
    password: String, // required.
    plantsOwned: [{type: mongoose.Schema.Types.ObjectId, ref: 'Plant'}], 
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;

