import {
  AlertCircle,
  Bath,
  Bed,
  Building2,
  MapPin,
  Plus,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Property } from "./types";

export function ProertiesOverview({ properties }: { properties: Property[] }) {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            Properties Overview
          </h2>
          <Link
            to="/dashboard/properties"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Link>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.slice(0, 3).map((property) => (
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
                <div className="absolute top-2 right-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      property.compliance_status === "compliant"
                        ? "bg-green-100 text-green-800"
                        : property.compliance_status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {property.compliance_status}
                  </span>
                </div>
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
                {property.property_leases &&
                property.property_leases.length > 0 &&
                property.property_leases[0].tenant ? (
                  <div className="mt-4 text-sm text-gray-500">
                    <User className="h-4 w-4 inline mr-1" />
                    Tenant: {property.property_leases[0].tenant.name}
                  </div>
                ) : (
                  <div className="mt-4 text-sm text-yellow-500">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    Vacant
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
