import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import prisma from '../utils/prisma';
import { authGuard, AuthRequest } from '../middleware/auth';
import config from '../config';

const uploadDir = config.uploadDir;
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${path.basename(file.originalname)}`)
});

const allowedMimeTypes = [
  'image/png',
  'image/jpeg',
  'application/pdf',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'), false);
    }
  }
});
const router = Router();

router.post('/file', authGuard, upload.single('file'), async (req: AuthRequest, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'File is required' });
    if (!req.user?.businessId) {
      return res.status(403).json({ error: 'Business scope is required' });
    }

    const record = await prisma.fileUpload.create({
      data: {
        filename: req.file.originalname,
        path: req.file.path,
        mimeType: req.file.mimetype,
        uploadedById: req.user.id,
        businessId: req.user.businessId
      }
    });
    return res.status(201).json(record);
  } catch (err) {
    next(err);
  }
});

router.post('/import', authGuard, upload.single('file'), async (req, res) => {
  res.json({ message: 'Import endpoint scaffolded. Add XLSX/CSV parsing and inventory import logic for production.', file: req.file?.originalname });
});

export default router;
