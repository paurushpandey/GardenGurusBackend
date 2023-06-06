const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    name: String,
    text: String,
    media: Array,
    comments: [String]
});

const Post = mongoose.models.Post || mongoose.model("Post", postSchema);
module.exports = Post;

