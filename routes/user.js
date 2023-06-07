const express = require("express");
const router = express.Router();
const request = require("request");
const User = require("../models/user");
const Plant = require("../models/plant");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
  if (req.headers && req.headers.authorization) {
    let authorization = req.headers.authorization.split(" ")[1],
      decoded;
    try {
      decoded = jwt.verify(authorization, "RANDOM-TOKEN");
      // console.log(decoded)
    } catch (e) {
      return res.status(401).send("Token not authorized or expired");
    }
    // console.log(decoded)
    let userId = decoded.userId;
    // console.log(userId)
    // Fetch the user by id
    User.findOne({ _id: userId }).then(function (user) {
      user.plantsOwned.push({
        plant: plant_id,
        dateLastWatered: Date.now(),
        posts: [],
        plantNumber: user.plantsOwned.length,
      });
      console.log(user);
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
    });
  }
};

const getUsersPlants = async (req, res) => {
  if (req.headers && req.headers.authorization) {
    let authorization = req.headers.authorization.split(" ")[1],
      decoded;
    try {
      decoded = jwt.verify(authorization, "RANDOM-TOKEN");
      // console.log(decoded)
    } catch (e) {
      return res.status(401).send("Token not authorized or expired");
    }
    let userId = decoded.userId;
    try {
      User.findOne({ _id: userId }).then(async function (user) {
        const plantArray = await Promise.all(
          user.plantsOwned.map((p) => getPlant(p.plant))
        );
        res.status(200).json({
          plantsOwned: user.plantsOwned,
          plantArray: plantArray,
        });
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

const updateWatered = async (req, res) => {
  const { plantNumber } = req.body;
  if (req.headers && req.headers.authorization) {
    let authorization = req.headers.authorization.split(" ")[1],
      decoded;
    try {
      decoded = jwt.verify(authorization, "RANDOM-TOKEN");
    } catch (e) {
      return res.status(401).send("Token not authorized or expired");
    }
    let userId = decoded.userId;
    User.findOne({ _id: userId }).then(function (user) {
      user.plantsOwned[plantNumber].dateLastWatered = Date.now();
      console.log(user);
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
    });
  }
};

const getUsersFriendsPlants = async (req, res) => {
  if (req.headers && req.headers.authorization) {
    let authorization = req.headers.authorization.split(" ")[1],
      decoded;
    try {
      decoded = jwt.verify(authorization, "RANDOM-TOKEN");
      // console.log(decoded)
    } catch (e) {
      return res.status(401).send("Token not authorized or expired");
    }
    let userId = decoded.userId;
    try {
      User.findOne({ _id: userId }).then(async function (user) {
        const friendsPlants = await Promise.all(
          user.friends.map((f) => getPlantsFromUserId(f))
        );
        // console.log(friendsPlants)
        res.status(200).json({
          friendsPlants
        });
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

const removePlant = async (req, res) => {
  const { plantNumber } = req.body;
  if (req.headers && req.headers.authorization) {
    let authorization = req.headers.authorization.split(" ")[1],
      decoded;
    try {
      decoded = jwt.verify(authorization, "RANDOM-TOKEN");
    } catch (e) {
      return res.status(401).send("Token not authorized or expired");
    }
    let userId = decoded.userId;
    User.findOne({ _id: userId }).then(function (user) {
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
    });
  }
};

const addFriend = async (req, res) => {
  const { friend_id } = req.body;
  if (req.headers && req.headers.authorization) {
    let authorization = req.headers.authorization.split(" ")[1],
      decoded;
    try {
      decoded = jwt.verify(authorization, "RANDOM-TOKEN");
      // console.log(decoded)
    } catch (e) {
      return res.status(401).send("Token not authorized or expired");
    }
    let userId = decoded.userId;
    User.findOne({ _id: userId }).then(function (user) {
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
    });
  }
};

router.post("/register", register);
router.post("/login", login);
router.get("/get-all-users", getAllUsers);
router.get("/get-users-friends-plants", getUsersFriendsPlants);
router.post("/add-friend", addFriend);
router.post("/add-plant", addPlant);
router.post("/update-watered", updateWatered);
router.get("/get-users-plants", getUsersPlants);
router.post("/remove-plant", removePlant);

module.exports = router;

// Helper functions

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

const getPlantsFromUserId = async (userId) => {
  // console.log(userId)
  id = userId.toString()
  try {
    const plants = await User.findOne({ _id: id }).then(async function (user) {
      const plantArray = await Promise.all(
        user.plantsOwned.map((p) => getPlant(p.plant))
      );
      let json = {
        friendId: userId,
        plantArray: plantArray,
      }
      return json
    });
    return plants
  } catch (err) {
    console.log(err.message)
  }

}
