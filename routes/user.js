const express = require("express");
const router = express.Router();
const request = require("request");
const User = require("../models/user");
const Plant = require("../models/plant");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const { getPlant } = require("../helpers/plants");
const { getPlantsFromUserId, getUser } = require("../helpers/user");

const register = async (req, res) => {
  const { name, email, password } = req.body;
  // hash the password
  bcrypt
    .hash(password, 10)
    .then((hashedPassword) => {
      // create a new user instance and collect the data
      const user = new User({
        name: name,
        email: email,
        password: hashedPassword,
        public: true,
        coins: 0,
        avatarsUnlocked: [1, 0, 0],
      });

      // save the new user
      user
        .save()
        // return success if the new user is added to the database successfully
        .then((result) => {
          res.status(201).send({
            message: "User Created Successfully",
            result,
          });
        })
        // catch error if the new user wasn't added successfully to the database
        .catch((error) => {
          res.status(500).send({
            message: "Error creating user",
            error,
          });
        });
    })
    // catch error if the password hash isn't successful
    .catch((e) => {
      res.status(500).send({
        message: "Password was not hashed successfully",
        e,
      });
    });
};

// login endpoint
const login = async (req, res) => {
  const { email, password } = req.body;
  // check if email exists
  User.findOne({ email: email })

    // if email exists
    .then((user) => {
      // compare the password entered and the hashed password found
      bcrypt
        .compare(password, user.password)

        // if the passwords match
        .then((passwordCheck) => {
          // check if password matches
          if (!passwordCheck) {
            return res.status(400).send({
              message: "Passwords does not match",
              error,
            });
          }

          //   create JWT token
          const token = jwt.sign(
            {
              userId: user._id,
              userEmail: user.email,
            },
            "RANDOM-TOKEN",
            { expiresIn: "24h" }
          );

          //   return success response
          res.status(200).send({
            message: "Login Successful",
            name: user.name,
            email: user.email,
            token,
          });
        })
        // catch error if password does not match
        .catch((error) => {
          res.status(400).send({
            message: "Passwords does not match",
            error,
          });
        });
    })
    // catch error if email does not exist
    .catch((e) => {
      res.status(404).send({
        message: "Email not found",
        e,
      });
    });
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addPlant = async (req, res) => {
  const { plant_id } = req.body;
  const user = await getUser(req);
  if (user === -1) {
    return res.status(401).send("Token not authorized or expired");
  }
  user.plantsOwned.push({
    plant: plant_id,
    dateLastWatered: Date.now(),
    posts: [],
    plantNumber: user.plantsOwned.length,
  });
  user.save().then((savedUser) => {
    if (user == savedUser) {
      res.status(200).send({
        message: "Added plant successfully",
        data: user,
      });
    } else {
      return res.status(400).json({
        message: err.message,
      });
    }
  });
};

const getUsersPlants = async (req, res) => {
  const user = await getUser(req);
  if (user === -1) {
    return res.status(401).send("Token not authorized or expired");
  }
  const plantArray = await Promise.all(
    user.plantsOwned.map((p) => getPlant(p.plant))
  );
  res.status(200).json({
    plantsOwned: user.plantsOwned,
    plantArray: plantArray,
  });
};

const updateWatered = async (req, res) => {
  const { plantNumber } = req.body;
  const user = await getUser(req);
  if (user === -1) {
    return res.status(401).send("Token not authorized or expired");
  }
  user.plantsOwned[plantNumber].dateLastWatered = Date.now();
  user.save().then((savedUser) => {
    if (user == savedUser) {
      res.status(200).send({
        message: "Watered plant successfully",
        data: user,
      });
    } else {
      return res.status(400).json({
        message: err.message,
      });
    }
  });
};

const getUsersFriends = async (req, res) => {
  const user = await getUser(req);
  if (user === -1) {
    return res.status(401).send("Token not authorized or expired");
  }
  const friends = await Promise.all(
    user.friends.map((f) => getPlantsFromUserId(f))
  );
  return res.status(200).json({
    friends,
  });
};

const removePlant = async (req, res) => {
  const { plantNumber } = req.body;
  const user = await getUser(req);
  if (user === -1) {
    return res.status(401).send("Token not authorized or expired");
  }
  user.plantsOwned.splice(plantNumber, 1);
  if (plantNumber < user.plantsOwned.length) {
    for (let i = plantNumber; i < user.plantsOwned.length; i++) {
      user.plantsOwned[i].plantNumber--;
    }
  }
  user.save().then((savedUser) => {
    if (user == savedUser) {
      res.status(200).send({
        message: "Deleted plant successfully",
        data: user,
      });
    } else {
      return res.status(400).json({
        message: err.message,
      });
    }
  });
};

const removeFriend = async (req, res) => {
  const { friend_id } = req.body;
  const user = await getUser(req);
  if (user === -1) {
    return res.status(401).send("Token not authorized or expired");
  }
  user.friends.splice(user.friends.indexOf(friend_id), 1);
  user.save().then((savedUser) => {
    if (user == savedUser) {
      res.status(200).send({
        message: "Deleted friend successfully",
        data: user,
      });
    } else {
      return res.status(400).json({
        message: err.message,
      });
    }
  });
};

const addFriend = async (req, res) => {
  const { friend_id } = req.body;
  const user = await getUser(req);
  if (user === -1) {
    return res.status(401).send("Token not authorized or expired");
  }
  if (user.friends.indexOf(friend_id) != -1) {
    return res.status(201).send({
      message: "Friend is already added!",
    });
  }
  user.friends.push(friend_id);
  console.log(user);
  user.save().then((savedUser) => {
    if (user == savedUser) {
      res.status(200).send({
        message: "Added friend successfully",
        data: user,
      });
    } else {
      return res.status(400).json({
        message: err.message,
      });
    }
  });
};

const updatePrivacy = async (req, res) => {
  const { privacy } = req.body;
  const user = await getUser(req);
  if (user === -1) {
    return res.status(401).send("Token not authorized or expired");
  }
  user.public = privacy;
  user.save().then((savedUser) => {
    if (user == savedUser) {
      res.status(200).send({
        message: "Changed privacy successfully",
        data: user,
      });
    } else {
      return res.status(400).json({
        message: err.message,
      });
    }
  });
};

const dryPlant = async (req, res) => {
  const { plantNumber, amt } = req.body;
  const user = await getUser(req);
  if (user === -1) {
    return res.status(401).send("Token not authorized or expired");
  }
  const newDate = moment(
    user.plantsOwned[plantNumber].dateLastWatered
  ).subtract(amt, "days");
  user.plantsOwned[plantNumber].dateLastWatered = newDate;
  console.log(user);
  user.save().then((savedUser) => {
    if (user == savedUser) {
      res.status(200).send({
        message: "Dried plant successfully",
        data: user,
      });
    } else {
      return res.status(400).json({
        message: err.message,
      });
    }
  });
};

const addCoins = async (req, res) => {
  const { amt } = req.body;
  const user = await getUser(req);
  if (user === -1) {
    return res.status(401).send("Token not authorized or expired");
  }
  if (user.coins === undefined) user.coins = amt;
  else user.coins = parseInt(user.coins) + parseInt(amt);
  console.log(user);
  user.save().then((savedUser) => {
    if (user == savedUser) {
      res.status(200).send({
        message: "Added coins successfully",
        data: user,
      });
    } else {
      return res.status(400).json({
        message: err.message,
      });
    }
  });
};

const updateAvatars = async (req, res) => {
  const { avatarNumber } = req.body;
  const user = await getUser(req);
  if (user === -1) {
    return res.status(401).send("Token not authorized or expired");
  }
  if (user.avatarsUnlocked == undefined || user.avatarsUnlocked.length != 3) {
    user.avatarsUnlocked = [1, 0, 0];
  }
  user.avatarsUnlocked[avatarNumber] = 1;
  console.log(user);
  user.save().then((savedUser) => {
    if (user == savedUser) {
      res.status(200).send({
        message: "Updated avatar successfully",
        data: user,
      });
    } else {
      return res.status(400).json({
        message: err.message,
      });
    }
  });
};

const updateAvatarSelected = async (req, res) => {
  const { avatarNumber } = req.body;
  const user = await getUser(req);
  if (user === -1) {
    return res.status(401).send("Token not authorized or expired");
  }
  if (user.avatarSelected == undefined) {
    user.avatarSelected = 0;
  }
  if (user.avatarsUnlocked[avatarNumber] == 0) {
    return res.status(400).json({
      message: "Avatar not unlocked!",
    });
  }
  user.avatarSelected = avatarNumber;
  console.log(user);
  user.save().then((savedUser) => {
    if (user == savedUser) {
      res.status(200).send({
        message: "Updated avatar successfully",
        data: user,
      });
    } else {
      return res.status(400).json({
        message: err.message,
      });
    }
  });
};

const getProfile = async (req, res) => {
  const user = await getUser(req);
  if (user === -1) {
    return res.status(401).send("Token not authorized or expired");
  }
  return res.status(200).json({
    coins: user.coins,
    public: user.public,
    avatarsUnlocked: user.avatarsUnlocked,
    avatarSelected: user.avatarSelected,
  });
};

router.post("/register", register);
router.post("/login", login);
router.get("/get-all-users", getAllUsers);
router.get("/get-users-friends", getUsersFriends);
router.post("/add-friend", addFriend);
router.post("/remove-friend", removeFriend);
router.post("/add-plant", addPlant);
router.post("/update-watered", updateWatered);
router.get("/get-users-plants", getUsersPlants);
router.post("/remove-plant", removePlant);
router.post("/update-privacy", updatePrivacy);
router.post("/dry-plant", dryPlant);
router.post("/add-coins", addCoins);
router.get("/get-profile", getProfile);
router.post("/update-avatars", updateAvatars);
router.post("/update-avatar-selected", updateAvatarSelected);

module.exports = router;
