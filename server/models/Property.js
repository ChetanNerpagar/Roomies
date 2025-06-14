import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['apartment', 'house', 'villa', 'studio', 'penthouse']
  },
  category: {
    type: String,
    required: true,
    enum: ['rent', 'sale']
  },
  bedrooms: {
    type: Number,
    required: true,
    min: 0
  },
  bathrooms: {
    type: Number,
    required: true,
    min: 0
  },
  area: {
    type: Number,
    required: true
  },
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  amenities: [{
    type: String
  }],
  images: [{
    url: String,
    public_id: String
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'rented', 'sold'],
    default: 'available'
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

propertySchema.index({ 'location.city': 1, price: 1, type: 1 });
propertySchema.index({ owner: 1 });

export default mongoose.model('Property', propertySchema);