const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require('dotenv').config();

// set up express server.
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 9000;

//  list all routes here, such as profileRoutes, messageRoutes, etc.
// const authRoutes = require("./routes/auth")
// const spotifyRoutes = require("./routes/spotify")
// const locationRoutes = require("./routes/location")

// route them accordingly eg. app.use("/profile", profileRoutes)
// app.use("/auth", authRoutes);
// app.use("/spotify", spotifyRoutes);
// app.use("/location", locationRoutes);

// basic health endpoint to quickly check if the server is up and running.
app.get('/health', (req, res) => {
    res.status(200).send({
        message: `GET /health on Port ${PORT} successful`
    })
})

app.listen(PORT, () => {
    console.log(`Listening on Port ${PORT}`);
});

const userRoutes = require("./routes/user");
const plantRoutes = require("./routes/plants");

app.use("/user", userRoutes);
app.use("/plant", plantRoutes);


const connectToDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to database");
    } catch (err) {
        console.log(err);
        console.log("Could not connect to database. Exiting...");
        process.exit(1);
    }
};

connectToDB();
