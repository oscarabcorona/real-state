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
              className="bg-white border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
            >
              <div className="h-48 bg-gray-200 relative group">
                {property.images?.[0] ? (
                  <>
                    <img
                      src={property.images[0]}
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200">
                      <div className="absolute bottom-4 left-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200">
                        <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          View Details
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <Building2 className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Available
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {property.name}
                </h3>
                <p className="text-sm text-gray-600 flex items-center gap-1 mb-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {property.address}, {property.city}, {property.state}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-lg font-bold text-indigo-600">
                    ${property.price.toLocaleString()}
                    <span className="text-sm font-normal">/month</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Bed className="h-4 w-4 mr-1 text-gray-400" />
                      {property.bedrooms}
                    </span>
                    <span className="flex items-center">
                      <Bath className="h-4 w-4 mr-1 text-gray-400" />
                      {property.bathrooms}
                    </span>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-100 text-sm text-gray-600 flex items-center gap-1">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Manager:</span>{" "}
                  {property.property_manager?.email}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
