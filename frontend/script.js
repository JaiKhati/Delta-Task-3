const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const uploadForm = document.getElementById('upload-form');
const uploadDiv = document.getElementById('upload');
const musicListDiv = document.getElementById('music-list');
const musicUl = document.getElementById('music-ul');
const createPlaylistDiv = document.getElementById('create-playlist');
const playlistForm = document.getElementById('playlist-form');
const playlistListDiv = document.getElementById('playlist-list');
const playlistUl = document.getElementById('playlist-ul');

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('register-username').value;
  const password = document.getElementById('register-password').value;
  
  const response = await fetch('http://localhost:5000/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await response.text();
  alert(data);
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  
  const response = await fetch('http://localhost:5000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await response.text();
  alert(data);
  if (data === 'Logged in successfully') {
    uploadDiv.style.display = 'block';
    musicListDiv.style.display = 'block';
    createPlaylistDiv.style.display = 'block';
    playlistListDiv.style.display = 'block';
    fetchMusic();
    fetchPlaylists(username);
  }
});

uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const musicFile = document.getElementById('music-file').files[0];
  const formData = new FormData();
  formData.append('file', musicFile, musicFile.name);
  
  const response = await fetch('http://localhost:5000/upload', {
    method: 'POST',
    headers: { 'file-name': musicFile.name },
    body: musicFile
  });
  const data = await response.text();
  alert(data);
  fetchMusic();
});

playlistForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const playlistName = document.getElementById('playlist-name').value;
  const username = document.getElementById('login-username').value;

  const response = await fetch('http://localhost:5000/playlists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: playlistName, userId: username })
  });
  const data = await response.text();
  alert(data);
  fetchPlaylists(username);
});

async function fetchMusic() {
  const response = await fetch('http://localhost:5000/music');
  const musicFiles = await response.json();
  musicUl.innerHTML = '';
  musicFiles.forEach(file => {
    const li = document.createElement('li');
    li.textContent = file;
    musicUl.appendChild(li);
  });
}

async function fetchPlaylists(username) {
  const response = await fetch(`http://localhost:5000/playlists/${username}`);
  const playlists = await response.json();
  playlistUl.innerHTML = '';
  playlists.forEach(playlist => {
    const li = document.createElement('li');
    li.textContent = playlist.name;
    playlistUl.appendChild(li);
  });
}
