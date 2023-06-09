const Plant = require("../models/plant");

const getPlant = async (plantId) => {
  id = plantId.toString();
  try {
    plants = await Plant.findOne({ _id: id }).then(function (plant) {
      return plant;
    });
    return plants;
  } catch (err) {
    console.log(err);
  }
};

module.exports = { getPlant };
