import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Home, Heart, User, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import PropertyCard from '../components/PropertyCard';

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

const DashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [properties, setProperties] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'owner') {
      fetchOwnerProperties();
    } else {
      fetchFavorites();
    }
  }, [user]);

  const fetchOwnerProperties = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/properties/owner/my-properties');
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/favorites');
      setFavorites(response.data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await axios.delete(`http://localhost:5000/api/properties/${propertyId}`);
        setProperties(properties.filter(p => p._id !== propertyId));
      } catch (error) {
        console.error('Error deleting property:', error);
      }
    }
  };

  const removeFavorite = async (propertyId: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/favorites/${propertyId}`);
      setFavorites(favorites.filter(p => p._id !== propertyId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    ...(user?.role === 'owner' ? [{ id: 'properties', label: 'My Properties', icon: Home }] : []),
    ...(user?.role === 'user' ? [{ id: 'favorites', label: 'Favorites', icon: Heart }] : []),
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
          </div>
          
          {user?.role === 'owner' && (
            <Link
              to="/add-property"
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Property
            </Link>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user?.role === 'owner' ? (
              <>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Home className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Properties</p>
                      <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center">
                    <div className="p-3 bg-emerald-100 rounded-full">
                      <Home className="h-8 w-8 text-emerald-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Available</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {properties.filter(p => p.status === 'available').length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center">
                    <div className="p-3 bg-orange-100 rounded-full">
                      <Home className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Rented/Sold</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {properties.filter(p => p.status !== 'available').length}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-3 bg-red-100 rounded-full">
                    <Heart className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Favorite Properties</p>
                    <p className="text-2xl font-bold text-gray-900">{favorites.length}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'properties' && user?.role === 'owner' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Properties</h2>
              <Link
                to="/add-property"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Add New Property
              </Link>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-300"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded mb-4 w-3/4"></div>
                      <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <div key={property._id} className="relative">
                    <PropertyCard property={property} />
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <button
                        onClick={() => {/* Handle edit */}}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProperty(property._id)}
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No properties yet</h3>
                <p className="text-gray-600 mb-4">Start by adding your first property.</p>
                <Link
                  to="/add-property"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Add Property
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && user?.role === 'user' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Favorite Properties</h2>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-300"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded mb-4 w-3/4"></div>
                      <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : favorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((property) => (
                  <PropertyCard 
                    key={property._id} 
                    property={property} 
                    onFavorite={removeFavorite}
                    isFavorite={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No favorites yet</h3>
                <p className="text-gray-600 mb-4">Start browsing properties to add them to your favorites.</p>
                <Link
                  to="/properties"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Browse Properties
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-gray-900">{user?.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{user?.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                  <p className="text-gray-900 capitalize">
                    {user?.role === 'owner' ? 'Property Owner' : 'Property Seeker'}
                  </p>
                </div>
                
                {user?.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <p className="text-gray-900">{user.phone}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;