import React, { useState, useEffect } from "react";
import {
  Home,
  Plus,
  Pencil,
  Trash2,
  X,
  ExternalLink,
  Share2,
  Camera,
  Bed,
  Bath,
  DollarSign,
  Building2,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";
import { Property, Tenant } from "./types";

export function Properties() {
  const { user } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  const [formData, setFormData] = useState({
    tenant_id: "",
    name: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    description: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    square_feet: "",
    property_type: "house",
    amenities: [] as string[],
    images: [] as string[],
    available_date: "",
    pet_policy: "",
    lease_terms: "",
    published: false,
    syndication: {
      zillow: false,
      trulia: false,
      realtor: false,
      hotpads: false,
    },
  });

  useEffect(() => {
    if (user) {
      fetchTenants();
      fetchProperties();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedTenant]);

  const fetchTenants = async () => {
    try {
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("status", "active")
        .order("name");

      if (error) throw error;
      setTenants(data || []);
    } catch (error) {
      console.error("Error fetching tenants:", error);
    }
  };

  const fetchProperties = async () => {
    try {
      let query = supabase
        .from("properties")
        .select(
          `
          *,
          property_leases (
            tenant:tenant_id (
              name
            )
          )
        `
        )
        .eq("user_id", user?.id);

      if (selectedTenant) {
        query = query.eq("property_leases.tenant_id", selectedTenant);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const propertyData = {
        ...formData,
        price: parseFloat(formData.price),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseFloat(formData.bathrooms),
        square_feet: parseInt(formData.square_feet),
      };

      if (editingProperty) {
        const { error } = await supabase
          .from("properties")
          .update({
            ...propertyData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingProperty.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("properties").insert([
          {
            ...propertyData,
            user_id: user?.id,
            compliance_status: "pending",
          },
        ]);

        if (error) throw error;
      }

      setIsModalOpen(false);
      resetForm();
      fetchProperties();
    } catch (error) {
      console.error("Error saving property:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      tenant_id: "",
      name: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      description: "",
      price: "",
      bedrooms: "",
      bathrooms: "",
      square_feet: "",
      property_type: "house",
      amenities: [],
      images: [],
      available_date: "",
      pet_policy: "",
      lease_terms: "",
      published: false,
      syndication: {
        zillow: false,
        trulia: false,
        realtor: false,
        hotpads: false,
      },
    });
    setEditingProperty(null);
    setActiveTab("details");
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setFormData({
      tenant_id: property.property_leases?.[0]?.tenant?.name || "",
      name: property.name,
      address: property.address,
      city: property.city,
      state: property.state,
      zip_code: property.zip_code,
      description: property.description || "",
      price: property.price?.toString() || "",
      bedrooms: property.bedrooms?.toString() || "",
      bathrooms: property.bathrooms?.toString() || "",
      square_feet: property.square_feet?.toString() || "",
      property_type: property.property_type || "house",
      amenities: property.amenities || [],
      images: property.images || [],
      available_date: property.available_date || "",
      pet_policy: property.pet_policy || "",
      lease_terms: property.lease_terms || "",
      published: property.published || false,
      syndication: property.syndication || {
        zillow: false,
        trulia: false,
        realtor: false,
        hotpads: false,
      },
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;

    try {
      const { error } = await supabase.from("properties").delete().eq("id", id);

      if (error) throw error;
      fetchProperties();
    } catch (error) {
      console.error("Error deleting property:", error);
    }
  };

  const handlePublish = async (property: Property) => {
    try {
      const { error } = await supabase
        .from("properties")
        .update({
          published: !property.published,
          updated_at: new Date().toISOString(),
        })
        .eq("id", property.id);

      if (error) throw error;
      fetchProperties();
    } catch (error) {
      console.error("Error publishing property:", error);
    }
  };

  // Property Form Modal
  const PropertyModal = () => (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-medium">
            {editingProperty ? "Edit Property" : "Add New Property"}
          </h3>
          <button
            onClick={() => {
              setIsModalOpen(false);
              resetForm();
            }}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex px-6" aria-label="Tabs">
            {["details", "features", "media", "marketplace"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm capitalize`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Details Tab */}
          {activeTab === "details" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tenant
                </label>
                <select
                  value={formData.tenant_id}
                  onChange={(e) =>
                    setFormData({ ...formData, tenant_id: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select a tenant</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Property Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={formData.zip_code}
                  onChange={(e) =>
                    setFormData({ ...formData, zip_code: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
          )}

          {/* Features Tab */}
          {activeTab === "features" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Monthly Rent
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="pl-7 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Square Feet
                  </label>
                  <input
                    type="number"
                    value={formData.square_feet}
                    onChange={(e) =>
                      setFormData({ ...formData, square_feet: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) =>
                      setFormData({ ...formData, bedrooms: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) =>
                      setFormData({ ...formData, bathrooms: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    step="0.5"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Property Type
                </label>
                <select
                  value={formData.property_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      property_type: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Available Date
                </label>
                <input
                  type="date"
                  value={formData.available_date}
                  onChange={(e) =>
                    setFormData({ ...formData, available_date: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pet Policy
                </label>
                <textarea
                  value={formData.pet_policy}
                  onChange={(e) =>
                    setFormData({ ...formData, pet_policy: e.target.value })
                  }
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Lease Terms
                </label>
                <textarea
                  value={formData.lease_terms}
                  onChange={(e) =>
                    setFormData({ ...formData, lease_terms: e.target.value })
                  }
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Media Tab */}
          {activeTab === "media" && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Camera className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Upload Photos
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>
          )}

          {/* Marketplace Tab */}
          {activeTab === "marketplace" && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900">
                  Syndication Settings
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  Choose where to list your property
                </p>
                <div className="mt-4 space-y-4">
                  {Object.entries(formData.syndication).map(
                    ([platform, enabled]) => (
                      <div key={platform} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              syndication: {
                                ...formData.syndication,
                                [platform]: e.target.checked,
                              },
                            })
                          }
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="ml-3 text-sm text-gray-700 capitalize">
                          {platform}
                        </label>
                      </div>
                    )
                  )}
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      published: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-3 text-sm text-gray-700">
                  Publish listing
                </label>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
                  Processing...
                </>
              ) : editingProperty ? (
                "Update Property"
              ) : (
                "Add Property"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
              <select
                value={selectedTenant}
                onChange={(e) => setSelectedTenant(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">All Tenants</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </button>
          </div>
        </div>

        <div className="p-6">
          {properties.length === 0 ? (
            <div className="text-center py-12">
              <Home className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No properties
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding a new property.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="bg-white overflow-hidden shadow rounded-lg border border-gray-200"
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
                        <Home className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${
                            property.published
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {property.published ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {property.name}
                      </h3>
                      {property.property_leases?.[0]?.tenant?.name && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Building2 className="h-4 w-4 mr-1" />
                          {property.property_leases[0].tenant.name}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {property.address}, {property.city}, {property.state}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Bed className="h-4 w-4 mr-1" />
                          {property.bedrooms}
                        </div>
                        <div className="flex items-center">
                          <Bath className="h-4 w-4 mr-1" />
                          {property.bathrooms}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4" />
                          {property.price}
                        </div>
                      </div>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
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
                  <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(property)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(property.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handlePublish(property)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Share2 className="h-4 w-4 mr-1" />
                          {property.published ? "Unpublish" : "Publish"}
                        </button>
                        {property.published && (
                          <a
                            href="#"
                            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && <PropertyModal />}
    </div>
  );
}
