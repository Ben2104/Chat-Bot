import express from "express";
import cors from "cors";
import { config } from "dotenv";
import sendMessages from "./routes/sendMessages.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use("/sendText", sendMessages);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// PDF upload endpoint
app.post('/upload-pdf', upload.single('pdf'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No PDF file uploaded' });
    }
    
    const filePath = `/uploads/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      message: 'PDF uploaded successfully',
      fileName: req.file.originalname,
      filePath: filePath
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error uploading file' });
  }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});