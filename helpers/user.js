const User = require("../models/user");
const { getPlant } = require("./plants");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const getPlantsFromUserId = async (userId) => {
  id = userId.toString();
  try {
    const plants = await User.findOne({ _id: id }).then(async function (user) {
      const plantArray = await Promise.all(
        user.plantsOwned.map((p) => getPlant(p.plant))
      );
      let json = {
        friend: user,
        plantArray: plantArray,
        coins: user.coins,
      };
      return json;
    });
    return plants;
  } catch (err) {
    console.log(err.message);
  }
};

const getUser = async (req) => {
  if (req.headers && req.headers.authorization) {
    let authorization = req.headers.authorization.split(" ")[1],
      decoded;
    try {
      decoded = jwt.verify(authorization, "RANDOM-TOKEN");
    } catch (e) {
      return -1;
    }
    let userId = decoded.userId;
    try {
      return User.findOne({ _id: userId });
    } catch (err) {
      return -1;
    }
  } else {
    return -1;
  }
};

module.exports = { getPlantsFromUserId, getUser };
