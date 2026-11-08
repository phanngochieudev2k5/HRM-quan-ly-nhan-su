import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '../../uploads/cv');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e4)}`;
    cb(null, `cv_${uniqueSuffix}_${cleanOriginalName}`);
  }
});

export const cvUpload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf') {
      return cb(new Error('Chỉ chấp nhận file định dạng PDF!'));
    }
    cb(null, true);
  }
});

const contractUploadDir = path.resolve(__dirname, '../../uploads/contracts');
if (!fs.existsSync(contractUploadDir)) {
  fs.mkdirSync(contractUploadDir, { recursive: true });
}

const contractStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, contractUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e4)}`;
    cb(null, `doc_${uniqueSuffix}_${cleanOriginalName}`);
  }
});

export const terminationUpload = multer({
  storage: contractStorage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
    if (!allowed.includes(ext)) {
      return cb(new Error('Chỉ chấp nhận file định dạng PDF, Word hoặc Ảnh scan (.pdf, .doc, .docx, .png, .jpg)!'));
    }
    cb(null, true);
  }
});

