import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import prisma from '../utils/prisma';
import { authGuard, AuthRequest } from '../middleware/auth';

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });
const router = Router();

router.post('/file', authGuard, upload.single('file'), async (req: AuthRequest, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'File is required' });
    const record = await prisma.fileUpload.create({
      data: {
        filename: req.file.originalname,
        path: req.file.path,
        mimeType: req.file.mimetype,
        uploadedById: req.user!.id,
        businessId: req.user!.businessId || ''
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
