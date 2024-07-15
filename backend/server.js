const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const cors = require('cors');
const multer = require('multer');


const app = express();

// Middleware
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cors());
app.use(express.static(path.join(__dirname, 'uploads')));

// MongoDB Atlas Connection
// const mongoURI = 'mongodb+srv://jaik2005:jaikhati2005@cluster0.sb4qiqf.mongodb.net/music-streaming?retryWrites=true&w=majority&appName=Cluster0';
// mongoose.connect(mongoURI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(() => console.log('MongoDB Atlas connected'))
// .catch(err => console.log(err));

mongoose.set("strictQuery", false);

const dev_db_url =
  "mongodb+srv://jaik2005:jaikhati2005@cluster0.sb4qiqf.mongodb.net/music-streaming?retryWrites=true&w=majority&appName=Cluster0";
const mongoDB = process.env.MONGODB_URI || dev_db_url;

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

// Multer configuration
const upload = multer({
  dest: 'uploads/', // Destination folder where files will be stored temporarily
  fileFilter: (req, file, cb) => {
      if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/wav' || file.mimetype === 'audio/ogg') {
          cb(null, true); // Accept file
      } else {
          cb(new Error('File type not supported!'), false); // Reject file
      }
  }
});

// Models
const User = require('./models/User');
const Playlist = require('./models/Playlist');

// Simple password storage (not recommended for production)
const hashPassword = (password) => Buffer.from(password).toString('base64');
const verifyPassword = (password, hash) => hash === hashPassword(password);

// Routes
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = hashPassword(password);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(200).send('Registered successfully');
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !verifyPassword(password, user.password)) {
      return res.status(400).send('Invalid credentials');
    }
    res.status(200).send('Logged in successfully');
  } catch (err) {
    res.status(500).send(err);
  }
});

// Route to handle file upload
app.post('/upload', upload.single('musicFile'), (req, res) => {
  // Check for file upload error
  if (req.fileValidationError) {
      return res.status(400).send(req.fileValidationError);
  }

  // Check if file was uploaded
  if (!req.file) {
      return res.status(400).send('Please upload a file');
  }

  // Check for other Multer errors
  if (req.file && req.file.mimetype !== 'audio/mpeg' && req.file.mimetype !== 'audio/wav' && req.file.mimetype !== 'audio/ogg') {
      return res.status(400).send('File type not supported');
  }

  // If no error, send success response
  res.send('File uploaded successfully!');
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
      return res.status(500).send(`Multer error: ${err.message}`);
  } else if (err) {
      return res.status(500).send(`Server error: ${err.message}`);
  }
  next();
});
app.post('/upload', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.headers['file-name']);
  const writeStream = fs.createWriteStream(filePath);
  req.pipe(writeStream);
  req.on('end', () => res.status(200).send('Music uploaded successfully'));
});

app.get('/music', (req, res) => {
  fs.readdir(path.join(__dirname, 'uploads'), (err, files) => {
    if (err) {
      return res.status(500).send('Unable to scan files');
    }
    res.status(200).json(files);
  });
});

app.get('/music/:filename', (req, res) => {
  const file = path.join(__dirname, 'uploads', req.params.filename);
  res.sendFile(file);
});

app.post('/playlists', async (req, res) => {
  const playlist = new Playlist({
    name: req.body.name,
    thumbnail: req.body.thumbnail,
    user: req.body.userId
  });
  await playlist.save();
  res.status(200).send('Playlist created successfully');
});

app.post('/playlists/:id/songs', async (req, res) => {
  const playlist = await Playlist.findById(req.params.id);
  playlist.songs.push(req.body.song);
  await playlist.save();
  res.status(200).send('Song added to playlist');
});

app.get('/playlists/:userId', async (req, res) => {
  const playlists = await Playlist.find({ user: req.params.userId });
  res.status(200).json(playlists);
});

app.use(express.json());

// Example route to create a playlist
app.post('/playlists', async (req, res) => {
    try {
        const { name, userId } = req.body;

        // Validate userId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).send('Invalid user ID');
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Create playlist
        const playlist = new Playlist({
            name,
            user: userId, // Assign valid ObjectId
        });

        await playlist.save();
        res.status(201).send(playlist);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
