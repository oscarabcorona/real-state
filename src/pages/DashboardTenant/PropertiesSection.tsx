import { Bath, Bed, Building2, MapPin, User } from "lucide-react";
import { Link } from "react-router-dom";
import type { Property } from "./types";

export function PropertiesSections({ properties }: { properties: Property[] }) {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Your Properties</h2>
          <Link
            to="/dashboard/marketplace"
            className="text-sm text-indigo-600 hover:text-indigo-900"
          >
            View All
          </Link>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <div
              key={property.id}
              className="bg-white border rounded-lg overflow-hidden"
            >
              <div className="h-48 bg-gray-200 relative">
                {property.images?.[0] ? (
                  <img
                    src={property.images[0]}
                    alt={property.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Building2 className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {property.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  {property.address}, {property.city}, {property.state}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-lg font-semibold text-indigo-600">
                    ${property.price.toLocaleString()}/month
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      {property.bedrooms}
                    </span>
                    <span className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      {property.bathrooms}
                    </span>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  <User className="h-4 w-4 inline mr-1" />
                  Property Manager: {property.property_manager?.email}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
