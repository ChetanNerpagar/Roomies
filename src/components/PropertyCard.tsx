import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Heart } from 'lucide-react';

interface Property {
  _id: string;
  title: string;
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
  };
  images: Array<{ url: string }>;
  status: string;
}

interface PropertyCardProps {
  property: Property;
  onFavorite?: (propertyId: string) => void;
  isFavorite?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onFavorite, isFavorite }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img
          src={property.images[0]?.url || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'}
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 left-2">
          <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium">
            {property.category === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
        </div>
        {onFavorite && (
          <button
            onClick={() => onFavorite(property._id)}
            className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors duration-200"
          >
            <Heart 
              className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
            />
          </button>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {property.title}
        </h3>
        
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{property.location.city}, {property.location.state}</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              <span>{property.bedrooms}</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              <span>{property.bathrooms}</span>
            </div>
            <div className="flex items-center">
              <Square className="h-4 w-4 mr-1" />
              <span>{property.area} sq ft</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-blue-600">
            {formatPrice(property.price)}
            {property.category === 'rent' && <span className="text-sm text-gray-600">/month</span>}
          </div>
          <Link
            to={`/properties/${property._id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;