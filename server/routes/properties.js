import express from 'express';
import { body, validationResult } from 'express-validator';
import Property from '../models/Property.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all properties with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      city,
      type,
      category,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      search
    } = req.query;

    const query = { status: 'available' };

    if (city) query['location.city'] = new RegExp(city, 'i');
    if (type) query.type = type;
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }
    if (bedrooms) query.bedrooms = parseInt(bedrooms);
    if (bathrooms) query.bathrooms = parseInt(bathrooms);
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { 'location.address': new RegExp(search, 'i') }
      ];
    }

    const properties = await Property.find(query)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Property.countDocuments(query);

    res.json({
      properties,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get featured properties
router.get('/featured', async (req, res) => {
  try {
    const properties = await Property.find({ featured: true, status: 'available' })
      .populate('owner', 'name email phone')
      .limit(8);

    res.json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single property
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name email phone avatar');

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create property (owner only)
router.post('/', auth, [
  body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('description').trim().isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('type').isIn(['apartment', 'house', 'villa', 'studio', 'penthouse']).withMessage('Invalid property type'),
  body('category').isIn(['rent', 'sale']).withMessage('Category must be rent or sale'),
  body('bedrooms').isInt({ min: 0 }).withMessage('Bedrooms must be a positive number'),
  body('bathrooms').isInt({ min: 0 }).withMessage('Bathrooms must be a positive number'),
  body('area').isNumeric().withMessage('Area must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Only owners can create properties' });
    }

    const property = new Property({
      ...req.body,
      owner: req.user._id
    });

    await property.save();
    await property.populate('owner', 'name email phone');

    // Add property to user's properties array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { properties: property._id }
    });

    res.status(201).json(property);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update property (owner only)
router.put('/:id', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this property' });
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('owner', 'name email phone');

    res.json(updatedProperty);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete property (owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this property' });
    }

    await Property.findByIdAndDelete(req.params.id);

    // Remove property from user's properties array
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { properties: req.params.id }
    });

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get owner's properties
router.get('/owner/my-properties', auth, async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const properties = await Property.find({ owner: req.user._id })
      .sort({ createdAt: -1 });

    res.json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;