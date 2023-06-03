const mongoose = require("mongoose");

const plantSchema = new mongoose.Schema({
    name: String, 
    description: String,
    wateringTime: String,
    frequency: Number,
    size: String,
    difficulty: String,
    media:Array,
    soilpH: Number
});


const Plant = mongoose.models.Plant || mongoose.model("Plant", plantSchema);
module.exports = Plant;
