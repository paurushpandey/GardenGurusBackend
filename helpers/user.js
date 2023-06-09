const User = require('../models/user');
const { getPlant } = require('./plants')

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

module.exports = { getPlantsFromUserId }
