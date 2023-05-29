const mongoose = require("mongoose");

const plantSchema = new mongoose.Schema({
    name: String, // required.
    description: String,
    wateringTime: String,
    frequency: Number,
    size: String,
    difficulty: String
});


const Plant = mongoose.models.Plant || mongoose.model("Plant", plantSchema);
module.exports = Plant;
