import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Heart, 
  Phone, 
  Mail, 
  ArrowLeft,
  Calendar,
  Home,
  Car,
  Wifi,
  Dumbbell,
  Trees,
  Shield
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  type: string;
  category: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  amenities: string[];
  images: Array<{ url: string }>;
  owner: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  status: string;
  createdAt: string;
}

const PropertyDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/properties/${id}`);
      setProperty(response.data);
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      toast.error('Please login to add favorites');
      return;
    }

    try {
      if (isFavorite) {
        await axios.delete(`http://localhost:5000/api/users/favorites/${id}`);
        setIsFavorite(false);
        toast.success('Removed from favorites');
      } else {
        await axios.post(`http://localhost:5000/api/users/favorites/${id}`);
        setIsFavorite(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getAmenityIcon = (amenity: string) => {
    const iconMap: { [key: string]: any } = {
      'parking': Car,
      'wifi': Wifi,
      'gym': Dumbbell,
      'garden': Trees,
      'security': Shield,
      'swimming pool': Home
    };
    
    const Icon = iconMap[amenity.toLowerCase()] || Home;
    return <Icon className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Property not found</h2>
          <Link to="/properties" className="text-blue-600 hover:text-blue-800">
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/properties"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Properties
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="relative">
                <img
                  src={property.images[currentImageIndex]?.url || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'}
                  alt={property.title}
                  className="w-full h-96 object-cover"
                />
                <button
                  onClick={handleFavorite}
                  className="absolute top-4 right-4 p-3 bg-white/90 rounded-full hover:bg-white transition-colors duration-200"
                >
                  <Heart 
                    className={`h-6 w-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                  />
                </button>
              </div>
              
              {property.images.length > 1 && (
                <div className="flex space-x-2 p-4 overflow-x-auto">
                  {property.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        currentImageIndex === index ? 'border-blue-600' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`${property.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{property.location.address}, {property.location.city}, {property.location.state}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    {formatPrice(property.price)}
                    {property.category === 'rent' && <span className="text-lg text-gray-600">/month</span>}
                  </div>
                  <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {property.category === 'rent' ? 'For Rent' : 'For Sale'}
                  </span>
                </div>
              </div>

              {/* Property Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <Bed className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-gray-900">{property.bedrooms}</p>
                  <p className="text-sm text-gray-600">Bedrooms</p>
                </div>
                <div className="text-center">
                  <Bath className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-gray-900">{property.bathrooms}</p>
                  <p className="text-sm text-gray-600">Bathrooms</p>
                </div>
                <div className="text-center">
                  <Square className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-gray-900">{property.area}</p>
                  <p className="text-sm text-gray-600">Sq Ft</p>
                </div>
                <div className="text-center">
                  <Home className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-gray-900 capitalize">{property.type}</p>
                  <p className="text-sm text-gray-600">Type</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </div>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-2 text-gray-700">
                        {getAmenityIcon(amenity)}
                        <span className="capitalize">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Owner Contact */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Owner</h2>
              
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3">
                  {property.owner.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{property.owner.name}</p>
                  <p className="text-sm text-gray-600">Property Owner</p>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href={`tel:${property.owner.phone}`}
                  className="flex items-center justify-center w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Call Now
                </a>
                
                <a
                  href={`mailto:${property.owner.email}`}
                  className="flex items-center justify-center w-full border border-blue-600 text-blue-600 py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Send Email
                </a>
              </div>
            </div>

            {/* Property Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Property Information</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Property ID</span>
                  <span className="font-medium text-gray-900">{property._id.slice(-6).toUpperCase()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium text-gray-900 capitalize">{property.type}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="font-medium text-green-600 capitalize">{property.status}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Listed on</span>
                  <span className="font-medium text-gray-900">
                    {new Date(property.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;