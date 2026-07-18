import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '@middleware/errorHandler';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure the uploads directory exists at startup
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_MIME_TYPES = ['application/pdf', 'text/plain', 'text/markdown'];
const ALLOWED_EXTENSIONS = ['.pdf', '.txt', '.md'];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isMimeAllowed = ALLOWED_MIME_TYPES.includes(file.mimetype);
  const isExtAllowed = ALLOWED_EXTENSIONS.includes(ext);

  // Markdown files may arrive as 'text/plain' or 'application/octet-stream' from browsers
  const isMarkdownByExt = ext === '.md';

  if ((isMimeAllowed || isMarkdownByExt) && isExtAllowed) {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF, TXT, and Markdown files are allowed', 400));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});
