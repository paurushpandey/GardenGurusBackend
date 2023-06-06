const express = require("express");
const router = express.Router();
const request = require('request');
const Plant = require('../models/plant');

const uploadPlant = async (req, res) => {
    const { name, description, wateringTime, frequency, size, difficulty, media, soilpH } = req.body;
    const plant = new Plant({
        name: name,
        description: description,
        wateringTime: wateringTime,
        frequency: frequency,
        media: media,
        size: size,
        difficulty: difficulty,
        soilpH: soilpH
    });
    console.log(plant);

    try {
        await plant.save();
        return res.status(200).json({
            success: true,
            message: "Plant successfully added!",
            data: plant,
        });
        // console.log(result);
    } catch (err) {
        if (
            err.message.includes("duplicate")
        ) {
            return res.status(400).json({
                success: false,
                message: "An plant with that name already exists.",
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
}

const getAllPlants = async (req, res) => {
    try {
        const plants = await Plant.find();
        res.json(plants);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
}


router.post("/upload-plant", uploadPlant);
router.get("/get-all-plants", getAllPlants);


module.exports = router;