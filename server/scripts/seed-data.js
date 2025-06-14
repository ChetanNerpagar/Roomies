import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Property from '../models/Property.js';

dotenv.config();

const sampleUsers = [
  {
    name: 'John Smith',
    email: 'john.owner@example.com',
    password: 'password123',
    role: 'owner',
    phone: '+91-9876543210'
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.owner@example.com',
    password: 'password123',
    role: 'owner',
    phone: '+91-9876543211'
  },
  {
    name: 'Mike Wilson',
    email: 'mike.user@example.com',
    password: 'password123',
    role: 'user',
    phone: '+91-9876543212'
  }
];

const sampleProperties = [
  {
    title: 'Luxury 3BHK Apartment in Bandra West',
    description: 'Beautiful spacious apartment with modern amenities, close to linking road and Bandra station. Perfect for families with excellent connectivity and nearby schools.',
    price: 85000,
    type: 'apartment',
    category: 'rent',
    bedrooms: 3,
    bathrooms: 2,
    area: 1200,
    location: {
      address: '15th Road, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400050'
    },
    amenities: ['Parking', 'Gym', 'Swimming Pool', 'Security', 'WiFi', 'Elevator'],
    images: [
      { url: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg' },
      { url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg' }
    ],
    featured: true,
    status: 'available'
  },
  {
    title: 'Modern 2BHK Villa in Koramangala',
    description: 'Contemporary villa with garden space, perfect for young professionals. Located in the heart of Bangalore with easy access to tech parks and restaurants.',
    price: 4500000,
    type: 'villa',
    category: 'sale',
    bedrooms: 2,
    bathrooms: 2,
    area: 1500,
    location: {
      address: '5th Block, Koramangala',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560095'
    },
    amenities: ['Garden', 'Parking', 'Security', 'WiFi', 'Modular Kitchen'],
    images: [
      { url: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg' },
      { url: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg' }
    ],
    featured: true,
    status: 'available'
  },
  {
    title: 'Cozy 1BHK Studio in Gurgaon',
    description: 'Perfect for working professionals, fully furnished studio apartment with all modern amenities. Close to Cyber City and metro station.',
    price: 25000,
    type: 'studio',
    category: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    area: 600,
    location: {
      address: 'Sector 29, DLF Phase 3',
      city: 'Gurgaon',
      state: 'Haryana',
      zipCode: '122002'
    },
    amenities: ['Furnished', 'WiFi', 'AC', 'Parking', 'Security'],
    images: [
      { url: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg' },
      { url: 'https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg' }
    ],
    featured: false,
    status: 'available'
  },
  {
    title: 'Spacious 4BHK Penthouse in Powai',
    description: 'Luxurious penthouse with panoramic city views, private terrace, and premium fittings. Located in a gated community with world-class amenities.',
    price: 12000000,
    type: 'penthouse',
    category: 'sale',
    bedrooms: 4,
    bathrooms: 3,
    area: 2500,
    location: {
      address: 'Hiranandani Gardens',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400076'
    },
    amenities: ['Terrace', 'Gym', 'Swimming Pool', 'Clubhouse', 'Parking', 'Security', 'Garden'],
    images: [
      { url: 'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg' },
      { url: 'https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg' }
    ],
    featured: true,
    status: 'available'
  },
  {
    title: 'Traditional 3BHK House in Jaipur',
    description: 'Beautiful traditional Rajasthani house with modern amenities. Features courtyard, traditional architecture, and peaceful neighborhood.',
    price: 45000,
    type: 'house',
    category: 'rent',
    bedrooms: 3,
    bathrooms: 2,
    area: 1800,
    location: {
      address: 'C-Scheme, Ashok Nagar',
      city: 'Jaipur',
      state: 'Rajasthan',
      zipCode: '302001'
    },
    amenities: ['Courtyard', 'Parking', 'Garden', 'Traditional Architecture'],
    images: [
      { url: 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg' },
      { url: 'https://images.pexels.com/photos/1396125/pexels-photo-1396125.jpeg' }
    ],
    featured: false,
    status: 'available'
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Property.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(userData.password, salt);
      
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      
      const savedUser = await user.save();
      createdUsers.push(savedUser);
    }
    console.log('Created sample users');

    // Create properties (assign to owners)
    const owners = createdUsers.filter(user => user.role === 'owner');
    
    for (let i = 0; i < sampleProperties.length; i++) {
      const propertyData = sampleProperties[i];
      const owner = owners[i % owners.length]; // Distribute properties among owners
      
      const property = new Property({
        ...propertyData,
        owner: owner._id
      });
      
      const savedProperty = await property.save();
      
      // Add property to owner's properties array
      await User.findByIdAndUpdate(owner._id, {
        $push: { properties: savedProperty._id }
      });
    }
    console.log('Created sample properties');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nSample Accounts:');
    console.log('Owner 1: john.owner@example.com / password123');
    console.log('Owner 2: sarah.owner@example.com / password123');
    console.log('User: mike.user@example.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();