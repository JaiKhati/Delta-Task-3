// const mongoose = require('mongoose');

// const PlaylistSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   thumbnail: String,
//   songs: [{ type: String }],
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
// });

// module.exports = mongoose.model('Playlist', PlaylistSchema);

const mongoose = require('mongoose');
const { Schema } = mongoose;

const playlistSchema = new Schema({
    name: { type: String, required: true },
    thumbnail: String,
    songs: [{ type: String }],
    user: { type: Schema.Types.ObjectId, ref: 'User',required: true }, // Reference to User model
});

const Playlist = mongoose.model('Playlist', playlistSchema);

module.exports = Playlist;
