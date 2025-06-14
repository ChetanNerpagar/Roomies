import express from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import auth from '../middleware/auth.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload property images
router.post('/property-images', auth, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'housing-clone/properties',
            resource_type: 'image',
            transformation: [
              { width: 800, height: 600, crop: 'fill', quality: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve({
              url: result.secure_url,
              public_id: result.public_id
            });
          }
        );
        uploadStream.end(file.buffer);
      });
    });

    const images = await Promise.all(uploadPromises);
    res.json({ images });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error uploading images' });
  }
});

// Upload user avatar
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'housing-clone/avatars',
          resource_type: 'image',
          transformation: [
            { width: 200, height: 200, crop: 'fill', quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    res.json({
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error uploading avatar' });
  }
});

// Delete image
router.delete('/image/:publicId', auth, async (req, res) => {
  try {
    const { publicId } = req.params;
    await cloudinary.uploader.destroy(publicId);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting image' });
  }
});

export default router;