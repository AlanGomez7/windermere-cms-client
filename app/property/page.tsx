"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  X,
  Image as ImageIcon,
  List,
  Info,
  Star,
  Home,
  Loader2,
  Users,
} from "lucide-react";
import Link from "next/link";
import {
  useProperties,
  useCreateProperty,
  useDeleteProperty,
} from "@/hooks/use-api";
import { Property, apiClient } from "@/lib/api";
import { toast } from "sonner";

export default function PropertyListPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(
    null
  );

  const [form, setForm] = useState({
    name: "",
    nickname: "",
    description: "",
    address: "",
    refNo: "",
    price: "",
    longitude: "",
    petsfee:"",
    petsNos:"",
    cleaningfee:"",
    latitude: "",
    guests: "",
    bedrooms: "",
    bathrooms: "",
    features: [""],
    images: [] as File[],
  });

  // API hooks
  const [propertiesState, propertiesActions] = useProperties();
  const [createPropertyState, createPropertyActions] = useCreateProperty();
  const [deletePropertyState, deletePropertyActions] = useDeleteProperty();

  // Load properties on component mount
  useEffect(() => {
    loadProperties();
  }, []);

  // Update local state when API data changes
  useEffect(() => {
    if (propertiesState.data) {
      setProperties(propertiesState.data);
    }
  }, [propertiesState.data]);

  const loadProperties = async () => {
    try {
      await propertiesActions.execute();
    } catch (error) {
      toast.error("Failed to load properties");
    }
  };

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value, type } = e.target;
    let checked = false;
    if (type === "checkbox") {
      checked = (e.target as HTMLInputElement).checked;
    }
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleFeatureChange(index: number, value: string) {
    setForm((f) => ({
      ...f,
      features: f.features.map((feat, i) => (i === index ? value : feat)),
    }));
  }

  function addFeature() {
    setForm((f) => ({ ...f, features: [...f.features, ""] }));
  }

  function removeFeature(index: number) {
    setForm((f) => ({
      ...f,
      features: f.features.filter((_, i) => i !== index),
    }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setForm((f) => ({ ...f, images: files }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Validation
    if (
      !form.name ||
      !form.description ||
      !form.address ||
      !form.refNo ||
      !form.price ||
      !form.longitude ||
      !form.latitude
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (form.images.length !== 4) {
      toast.error(
        "Exactly 4 featured images are required for property creation"
      );
      return;
    }

    const features = form.features.filter((f) => f.trim() !== "");
    if (features.length === 0) {
      toast.error("At least one feature is required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("nickname", form.nickname);
      formData.append("description", form.description);
      formData.append("address", form.address);
      formData.append("refNo", form.refNo);
      formData.append("price", form.price);
      formData.append("petsNos", form.petsNos);
      formData.append("petsfee", form.petsfee);
      formData.append("cleaningfee", form.cleaningfee);
      formData.append("guests", form.guests);
      formData.append("bedrooms", form.bedrooms);
      formData.append("bathrooms", form.bathrooms);
      formData.append("longitude", form.longitude);
      formData.append("latitude", form.latitude);

      // Add features as array (not JSON string)
      features.forEach((feature) => {
        formData.append("features", feature);
      });

      // Add images
      form.images.forEach((image, index) => {
        formData.append("images", image);
      });

      console.log(formData.get("guests"));

      await createPropertyActions.execute(formData);
      toast.success("Property created successfully!");
      setShowDialog(false);
      resetForm();
      loadProperties(); // Reload the list
    } catch (error) {
      console.error("Property creation error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create property"
      );
    }
  }

  function resetForm() {
    setForm({
      name: "",
      nickname: "",
      description: "",
      address: "",
      refNo: "",
      price: "",
      longitude: "",
      petsfee:"",
      petsNos:"",
      cleaningfee:"",
      latitude: "",
      guests: "",
      bedrooms: "",
      bathrooms: "",
      features: [""],
      images: [],
    });
  }

  async function handleDeleteProperty(id: string) {
    const property = properties.find((p) => p.id === id);
    if (property) {
      setPropertyToDelete(property);
      setShowDeleteConfirm(true);
    }
  }

  async function confirmDelete() {
    if (!propertyToDelete) return;

    try {
      await deletePropertyActions.execute(propertyToDelete.id);
      toast.success("Property and all related data deleted successfully!");
      setShowDeleteConfirm(false);
      setPropertyToDelete(null);
      loadProperties(); // Reload the list
    } catch (error) {
      console.error("Property deletion error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete property"
      );
    }
  }

  function cancelDelete() {
    setShowDeleteConfirm(false);
    setPropertyToDelete(null);
  }

  if (propertiesState.loading && properties.length === 0) {
    return (
      <div className="p-6 bg-gray-50 min-h-full flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading properties...</span>
        </div>
      </div>
    );
  }

  if (propertiesState.error && properties.length === 0) {
    return (
      <div className="p-6 bg-gray-50 min-h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load properties</p>
          <button
            onClick={loadProperties}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Our Lodges</h1>
          <p className="text-gray-600 mt-1">
            Discover our beautiful properties in the Lake District
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow transition"
          onClick={() => setShowDialog(true)}
        >
          <Plus className="w-5 h-5" /> Add New Lodge
        </button>
      </div>

      {/* Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-4xl relative overflow-y-auto max-h-screen border border-gray-200"
            style={{ scrollbarGutter: "stable" }}
          >
            <button
              type="button"
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600"
              onClick={() => setShowDialog(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-3xl font-extrabold mb-8 text-gray-900 flex items-center gap-3">
              <Home className="w-7 h-7 text-teal-600" /> Add New Lodge
            </h2>

            {/* Basic Details */}
            <div className="mb-10 p-6 rounded-xl bg-gray-50 border border-gray-200">
              <h3 className="font-bold text-xl mb-6 text-teal-700 flex items-center gap-2">
                <Info className="w-5 h-5 text-teal-500" /> Basic Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">
                    Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    step="any"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Nickname
                  </label>
                  <input
                    name="nickname"
                    value={form.nickname}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Reference Number
                  </label>
                  <input
                    name="refNo"
                    value={form.refNo}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Price
                  </label>
                  <input
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Maximum guests
                  </label>
                  <input
                    name="guests"
                    type="text"
                    value={form.guests}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Pets (Enter 0 if pets not allowed)
                  </label>
                  <input
                    name="petsNos"
                    value={form.petsNos}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Pets fee
                  </label>
                  <input
                    name="petsfee"
                    value={form.petsfee}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Cleaning fee
                  </label>
                  <input
                    name="cleaningfee"
                    value={form.cleaningfee}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Longitude
                  </label>
                  <input
                    name="longitude"
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Latitude
                  </label>
                  <input
                    name="latitude"
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Bedrooms
                  </label>
                  <input
                    name="bedrooms"
                    type="text"
                    step="any"
                    value={form.bedrooms}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Bathrooms
                  </label>
                  <input
                    name="bathrooms"
                    type="text"
                    step="any"
                    value={form.bathrooms}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">
                    Address
                  </label>
                  <input
                    name="address"
                    type="text"
                    step="any"
                    value={form.address}
                    onChange={handleChange}
                    required
                    placeholder="street, suite, city, state, zip, country"
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-lg px-4 py-2"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mb-10 p-6 rounded-xl bg-gray-50 border border-gray-200">
              <h3 className="font-bold text-xl mb-6 text-teal-700 flex items-center gap-2">
                <List className="w-5 h-5 text-teal-500" /> Features
              </h3>
              {form.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className="flex-grow border rounded-lg px-3 py-1"
                    placeholder="Feature name"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="text-teal-600 hover:text-teal-700 text-sm mt-2 font-semibold"
              >
                + Add Feature
              </button>
            </div>

            {/* Images */}
            <div className="mb-10 p-6 rounded-xl bg-gray-50 border border-gray-200">
              <h3 className="font-bold text-xl mb-6 text-teal-700 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-teal-500" /> Featured Images
                (Exactly 4 required)
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                These images will be displayed as the main featured images for
                the property. They will appear in property listings and as the
                primary gallery.
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border rounded-lg px-4 py-2"
                required
              />
              <div
                className={`text-sm mt-2 ${
                  form.images.length === 4 ? "text-green-600" : "text-red-600"
                }`}
              >
                Selected {form.images.length} featured images.{" "}
                {form.images.length === 4
                  ? "✓ Perfect!"
                  : `You need exactly 4 featured images.`}
              </div>
              {form.images.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {form.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Featured Image ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <div className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                        Featured {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={createPropertyState.loading || form.images.length !== 4}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white py-4 rounded-xl font-bold text-xl mt-2 shadow flex items-center justify-center gap-2"
            >
              {createPropertyState.loading && (
                <Loader2 className="w-5 h-5 animate-spin" />
              )}
              Add Lodge
            </button>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && propertyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete Property
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete{" "}
                <strong>{propertyToDelete.name}</strong>?
              </p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm font-semibold text-red-800 mb-2">
                  This will also delete:
                </p>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• All gallery images</li>
                  <li>• All bookings and payments</li>
                  <li>• All comments and reviews</li>
                  <li>• All enquiry bookings</li>
                </ul>
                <p className="text-sm font-semibold text-red-800 mt-2">
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deletePropertyState.loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  {deletePropertyState.loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Delete Property"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <Card
            key={property.id}
            className="hover:shadow-lg transition-shadow duration-200 overflow-hidden"
          >
            {/* Property Image with Overlays */}
            <div className="relative h-64 w-full bg-gray-200 overflow-hidden">
              {property.images && property.images.length > 0 ? (
                <img
                  src={apiClient.getImageUrl(property.images[0])}
                  alt={property.name}
                  className="object-cover w-full h-full"
                  loading="lazy"
                  onError={(e) => {
                    console.error(
                      "Image failed to load:",
                      apiClient.getImageUrl(property.images[0])
                    );
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove(
                      "hidden"
                    );
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                  <span className="text-gray-500">No image</span>
                </div>
              )}

              {/* Rating Overlay - Bottom Left */}
              <div className="absolute bottom-3 left-3 bg-white rounded-lg px-2 py-1 flex items-center gap-1 shadow-sm">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">4.5</span>
              </div>

              {/* Price Overlay - Bottom Right */}
              <div className="absolute bottom-3 right-3 bg-black bg-opacity-80 text-white rounded-lg px-3 py-1 shadow-sm">
                <span className="text-sm font-medium">
                  £{property.price?.toLocaleString()}/night
                </span>
              </div>
            </div>

            {/* Property Details */}
            <CardContent className="p-4">
              {/* Property Name and Price */}
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900 truncate flex-1 mr-2">
                  {property.name}
                </h3>
                <span className="text-sm text-gray-500 font-medium whitespace-nowrap">
                  £{property.price?.toLocaleString()}/night
                </span>
              </div>

              {/* Location and Reference */}
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                {property.address} (Ref. {property.refNo})
              </p>

              {/* Capacity and Size */}
              <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{property.guests}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 border-2 border-gray-400 rounded-sm flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
                  </div>
                  <span>{property.bedrooms} bedrooms</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 border-2 border-gray-400 rounded-sm flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
                  </div>
                  <span>{property.bathrooms} bathrooms</span>
                </div>
              </div>

              {/* Amenities Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {property.features &&
                  property.features.slice(0, 4).map((feature, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs px-2 py-1"
                    >
                      {feature}
                    </Badge>
                  ))}
                {property.features && property.features.length > 4 && (
                  <Badge
                    variant="secondary"
                    className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs px-2 py-1"
                  >
                    +{property.features.length - 4}
                  </Badge>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Link
                  href={`/property/${property.id}`}
                  className="flex-1 border-2 border-teal-600 text-teal-600 bg-white text-center py-2 rounded-lg hover:bg-teal-50 transition font-medium text-sm"
                >
                  View Details
                </Link>
                <button
                  onClick={() => handleDeleteProperty(property.id)}
                  className="flex-1 bg-teal-600 text-white text-center py-2 rounded-lg hover:bg-teal-700 transition font-medium text-sm"
                >
                  Delete Property
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {properties.length === 0 && !propertiesState.loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No properties found. Add your first property!
          </p>
        </div>
      )}
    </div>
  );
}
