const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, unique: true }, // required.
    email: { type: String, unique: true }, // required.
    password: String, // required.
    plantsOwned: [{
        plant: {type: mongoose.Schema.Types.ObjectId, ref: 'Plant'},
        dateLastWatered: { type: Date, default: Date.now },
        posts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}]
    }], 
    friends: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;

