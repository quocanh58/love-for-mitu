console.log('🔥 SERVER VERSION:', new Date().toISOString());

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3503;
const SECRET_TOKEN = "love_token_21122025"; // Simple secret token
const PASSWORD = "21122025"; // Password for Index

// Middleware
app.use(cors());
app.use(bodyParser.json());
// Cache assets (Music) for 7 days to eliminate network delay
// app.use(express.static('public', { maxAge: '7d' }));

// app.use(express.static('public', {
//   etag: false,
//   lastModified: false,
//   maxAge: 0
// }));

app.use(express.json({ limit: '50mb' })); // Allow large images
// Data Paths
const DATA_DIR = path.join(__dirname, 'data');
const MEMORIES_FILE = path.join(DATA_DIR, 'memories.json');
const GALLERY_FILE = path.join(DATA_DIR, 'gallery.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
// PRIVATE IMAGE FOLDER
const PRIVATE_IMG_DIR = path.join(__dirname, 'private/img');
const UPLOAD_DIR = PRIVATE_IMG_DIR;

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(PRIVATE_IMG_DIR)) fs.mkdirSync(PRIVATE_IMG_DIR, { recursive: true });

// Helper to read/write JSON
const readData = (file) => {
    if (!fs.existsSync(file)) return [];
    try {
        const data = fs.readFileSync(file, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
};

const writeData = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// -- AUTH MIDDLEWARE --
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token === SECRET_TOKEN) {
        next();
    } else {
        res.sendStatus(401); // Unauthorized
    }
};

// -- LOGIN API --
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password && String(password).trim() === PASSWORD) {
        res.json({ token: SECRET_TOKEN });
    } else {
        res.status(401).json({ error: 'Wrong password' });
    }
});

// -- PROTECTED IMAGE API --
app.get('/api/images/:filename', authenticateToken, (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(PRIVATE_IMG_DIR, filename);
    
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).json({ error: 'Image not found' });
    }
});

// -- MEMORIES API (Protected) --
app.get('/api/memories', authenticateToken, (req, res) => {
    const memories = readData(MEMORIES_FILE);
    res.json(memories);
});

app.post('/api/memories', authenticateToken, (req, res) => {
    const { date, text } = req.body;
    if (!date || !text) return res.status(400).json({ error: 'Missing fields' });

    const memories = readData(MEMORIES_FILE);
    const newMemory = { 
        id: Date.now().toString(), 
        date, 
        text, 
        createdAt: Date.now() 
    };
    
    memories.unshift(newMemory);
    writeData(MEMORIES_FILE, memories);
    res.json(newMemory);
});

app.put('/api/memories/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { date, text } = req.body;
    const memories = readData(MEMORIES_FILE);
    const index = memories.findIndex(m => m.id === id);
    
    if (index !== -1) {
        memories[index] = { ...memories[index], date, text };
        writeData(MEMORIES_FILE, memories);
        res.json(memories[index]);
    } else {
        res.status(404).json({ error: 'Memory not found' });
    }
});

app.delete('/api/memories/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    let memories = readData(MEMORIES_FILE);
    memories = memories.filter(m => m.id !== id);
    writeData(MEMORIES_FILE, memories);
    res.json({ success: true });
});

// -- MESSAGES API (Protected) --
app.get('/api/messages/:id', authenticateToken, (req, res) => {
    const messages = readData(MESSAGES_FILE);
    const message = messages.find(m => m.id === req.params.id);
    if (message) {
        res.json(message);
    } else {
        res.status(404).json({ error: 'Message not found' });
    }
});

app.post('/api/messages', authenticateToken, (req, res) => {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });

    const messages = readData(MESSAGES_FILE);
    const id = Math.random().toString(36).substr(2, 9);
    const newMessage = { id, content, createdAt: Date.now() };

    messages.push(newMessage);
    writeData(MESSAGES_FILE, messages);
    res.json(newMessage);
});

// -- GALLERY API (Protected) --
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, 'img' + Date.now() + ext);
    }
});
const upload = multer({ storage });

app.get('/api/gallery', authenticateToken, (req, res) => {
    const gallery = readData(GALLERY_FILE);
    res.json(gallery);
});

app.post('/api/gallery', authenticateToken, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    
    const { date } = req.body;
    const gallery = readData(GALLERY_FILE);
    
    const newImage = {
        src: req.file.filename,
        date: date || new Date().toLocaleDateString('en-GB')
    };

    gallery.push(newImage); 
    writeData(GALLERY_FILE, gallery);

    res.json(newImage);
});

app.delete('/api/gallery/:filename', authenticateToken, (req, res) => {
    const { filename } = req.params;
    let gallery = readData(GALLERY_FILE);
    
    const exists = gallery.some(img => img.src === filename);
    if(!exists) return res.status(404).json({error: 'Image not found'});

    gallery = gallery.filter(img => img.src !== filename);
    writeData(GALLERY_FILE, gallery);

    const filePath = path.join(UPLOAD_DIR, filename);
    if(fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    res.json({ success: true });
});

app.put('/api/gallery/:filename', authenticateToken, (req, res) => {
    const { filename } = req.params;
    const { date } = req.body;
    
    const gallery = readData(GALLERY_FILE);
    const img = gallery.find(i => i.src === filename);
    
    if(img) {
        img.date = date;
        writeData(GALLERY_FILE, gallery);
        res.json(img);
    } else {
        res.status(404).json({error: 'Image not found'});
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.send('❤️ Love for Mitu server is running');
});

