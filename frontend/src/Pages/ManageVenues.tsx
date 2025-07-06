import { useState, useEffect } from "react";
import VOFooter from "../Components/Footer/VOFooter";
import VenueNavbar from "../Components/Navbar/VenueNavbar";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaMapMarkerAlt,
  FaClock,
  FaPhone,
  FaUsers,
  FaEye,
  FaCalendarAlt,
  FaSave,
  FaChartBar,
} from "react-icons/fa";

// Imports for Connecting Frontend to Backend
import {
  getVenues,
  //getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
} from "../../services/venueService";

interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface Venue {
  _id: string;
  name: string;
  description: string;
  owner: string;
  address: Address;
  sports: string[];
  contactNumber: string;
  openingTime: string;
  closingTime: string;
  isActive: boolean;
}

const ManageVenues = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch venues on component mount
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const data = await getVenues();
        setVenues(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch venues");
        setLoading(false);
        console.error(err);
      }
    };

    fetchVenues();
  }, []);

  const handleDeleteVenue = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this venue?")) {
      try {
        await deleteVenue(id);
        setVenues(venues.filter((venue) => venue._id !== id));
      } catch (err) {
        setError("Failed to delete venue");
        console.error(err);
      }
    }
  };

  const handleSubmitVenue = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const venueData = {
      name: formData.get("venueName") as string,
      description: formData.get("description") as string,
      sports: (formData.get("sports") as string)
        .split(",")
        .map((s: string) => s.trim()),
      address: {
        street: formData.get("street") as string,
        city: formData.get("city") as string,
        state: formData.get("state") as string,
        country: formData.get("country") as string,
        zipCode: formData.get("zipCode") as string,
      },
      contactNumber: formData.get("contactNumber") as string,
      openingTime: formData.get("openingTime") as string,
      closingTime: formData.get("closingTime") as string,
      isActive: formData.get("status") === "true",
      owner: editingVenue?.owner || "6863d1cfa8d1e82535f71e3e",
    };

    try {
      if (editingVenue) {
        const updatedVenue = await updateVenue(editingVenue._id, venueData);
        setVenues(
          venues.map((v) => (v._id === editingVenue._id ? updatedVenue : v))
        );
      } else {
        const newVenue = await createVenue(venueData);
        setVenues([...venues, newVenue]);
      }
      setShowAddModal(false);
      setEditingVenue(null);
    } catch (err) {
      setError(
        editingVenue ? "Failed to update venue" : "Failed to create venue"
      );
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditVenue = (venue: Venue) => {
    setEditingVenue(venue);
    setShowAddModal(true);
  };

  const handleAddVenue = () => {
    setEditingVenue(null);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingVenue(null);
    setError(null);
  };

  const activeVenues = venues.filter((v) => v.isActive).length;
  const multiSportVenues = venues.filter((v) => v.sports.length > 1).length;

  const formatAddress = (address: Address) => {
    return `${address.city}, ${address.state}`;
  };

  if (loading) {
    return (
      <>
        <VenueNavbar />

        <div className="min-h-screen bg-[#FFFFF8] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading venues...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <VenueNavbar />

      <div className="min-h-screen bg-[#FFFFF8]">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-black to-gray-900 px-6 sm:px-12 lg:px-20 pt-12 pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
                    <FaChartBar className="text-black text-xl" />
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
                      Venue Management
                    </h1>
                    <p className="text-gray-300 text-lg mt-1">
                      Comprehensive management for all your locations
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === "grid"
                        ? "bg-white text-black shadow-sm"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === "list"
                        ? "bg-white text-black shadow-sm"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    List
                  </button>
                </div>

                <button
                  onClick={handleAddVenue}
                  className="group flex items-center space-x-2 px-6 py-3 bg-white text-black rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 border-2 border-gray-800"
                >
                  <FaPlus className="group-hover:rotate-90 transition-transform duration-200" />
                  <span>New Venue</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Section */}
        <div className="px-6 sm:px-12 lg:px-20 -mt-8 mb-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Total Venues",
                  value: venues.length,
                  icon: FaChartBar,
                  color: "bg-gray-100",
                },
                {
                  title: "Active Locations",
                  value: activeVenues,
                  icon: FaEye,
                  color: "bg-gray-100",
                },
                {
                  title: "Contact Provided",
                  value: venues.length,
                  icon: FaPhone,
                  color: "bg-gray-100",
                },
                {
                  title: "Multi-Sport",
                  value: multiSportVenues,
                  icon: FaUsers,
                  color: "bg-gray-100",
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-black">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}
                    >
                      <stat.icon className="text-black text-xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Venues Grid/List */}
        <div className="px-6 sm:px-12 lg:px-20 pb-16">
          <div className="max-w-7xl mx-auto">
            {venues.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🏟️</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No venues found
                </h3>
                <p className="text-gray-500 mb-6">
                  Get started by adding your first venue
                </p>
                <button
                  onClick={handleAddVenue}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                >
                  <FaPlus />
                  <span>Add First Venue</span>
                </button>
              </div>
            ) : (
              <div
                className={`gap-6 ${
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                    : "flex flex-col"
                }`}
              >
                {venues.map((venue) => (
                  <div
                    key={venue._id}
                    className={`group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${
                      viewMode === "list" ? "flex" : ""
                    }`}
                  >
                    {/* Venue Header */}
                    <div
                      className={`${
                        viewMode === "list" ? "w-48 flex-shrink-0" : ""
                      } bg-gradient-to-br from-gray-50 to-gray-100 p-8 text-center`}
                    >
                      <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-200">
                        ⚽
                      </div>
                      <h3 className="text-xl font-bold text-black mb-2">
                        {venue.name}
                      </h3>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {venue.sports.slice(0, 2).map((sport, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-white/80 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-full"
                          >
                            {sport}
                          </span>
                        ))}
                        {venue.sports.length > 2 && (
                          <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">
                            +{venue.sports.length - 2}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Venue Details */}
                    <div className="flex-1 p-6 space-y-4">
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                        {venue.description}
                      </p>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 text-gray-600">
                          <FaMapMarkerAlt className="text-gray-500 text-sm" />
                          <span className="text-sm font-medium">
                            {formatAddress(venue.address)}
                          </span>
                        </div>

                        <div className="flex items-center space-x-3 text-gray-600">
                          <FaClock className="text-gray-500 text-sm" />
                          <span className="text-sm">
                            {venue.openingTime} - {venue.closingTime}
                          </span>
                        </div>

                        <div className="flex items-center space-x-3 text-gray-600">
                          <FaPhone className="text-gray-500 text-sm" />
                          <span className="text-sm font-medium">
                            {venue.contactNumber}
                          </span>
                        </div>
                      </div>

                      {/* Status and Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              venue.isActive ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          <span
                            className={`text-sm font-medium ${
                              venue.isActive ? "text-green-700" : "text-red-700"
                            }`}
                          >
                            {venue.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditVenue(venue)}
                            className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit venue"
                          >
                            <FaEdit className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleDeleteVenue(venue._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete venue"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#FFFFF8] rounded-3xl max-w-4xl w-full max-h-[90vh] shadow-2xl border border-gray-300">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 rounded-t-3xl border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                      <FaCalendarAlt className="text-black text-sm" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-black">
                        {editingVenue ? "Edit Venue" : "Add New Venue"}
                      </h2>
                      <p className="text-gray-600 text-sm">
                        {editingVenue
                          ? "Update venue information and settings"
                          : "Create a new venue for your platform"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-xl hover:bg-gray-100"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto max-h-[calc(90vh-240px)]">
                <form
                  onSubmit={handleSubmitVenue}
                  className="px-8 py-8 space-y-10"
                >
                  {/* Basic Information */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <FaChartBar className="text-black text-sm" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-black">
                          Basic Information
                        </h3>
                        <p className="text-sm text-gray-600">
                          Essential details about your venue
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Venue Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="venueName"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                          placeholder="Enter venue name"
                          defaultValue={editingVenue?.name || ""}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Sports Available{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="sports"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                          placeholder="Football, Cricket, Basketball"
                          defaultValue={editingVenue?.sports.join(", ") || ""}
                        />
                        <p className="text-xs text-gray-500">
                          Separate multiple sports with commas
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="description"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white resize-none"
                        rows={4}
                        placeholder="Describe your venue, facilities, and what makes it special"
                        defaultValue={editingVenue?.description || ""}
                      />
                    </div>
                  </div>

                  {/* Location Information */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <FaMapMarkerAlt className="text-black text-sm" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-black">
                          Location Information
                        </h3>
                        <p className="text-sm text-gray-600">
                          Where your venue is located
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Street Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="street"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                        placeholder="123 Main Street, Building Name"
                        defaultValue={editingVenue?.address.street || ""}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="city"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                          placeholder="Mumbai"
                          defaultValue={editingVenue?.address.city || ""}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          State <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="state"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                          placeholder="Maharashtra"
                          defaultValue={editingVenue?.address.state || ""}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Country <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="country"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                          placeholder="India"
                          defaultValue={editingVenue?.address.country || ""}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Zip Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="zipCode"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                          placeholder="400001"
                          defaultValue={editingVenue?.address.zipCode || ""}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact & Hours */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <FaPhone className="text-black text-sm" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-black">
                          Contact & Hours
                        </h3>
                        <p className="text-sm text-gray-600">
                          How customers can reach you
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Contact Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="contactNumber"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                          placeholder="+91 9876543210"
                          defaultValue={editingVenue?.contactNumber || ""}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Opening Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          name="openingTime"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                          defaultValue={editingVenue?.openingTime || ""}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Closing Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          name="closingTime"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                          defaultValue={editingVenue?.closingTime || ""}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Venue Status
                      </label>
                      <select
                        name="status"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                        defaultValue={editingVenue?.isActive ? "true" : "false"}
                      >
                        <option value="true">
                          🟢 Active - Available for bookings
                        </option>
                        <option value="false">
                          🔴 Inactive - Temporarily unavailable
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Modal Footer - Inside Form */}
                  <div className="bg-gray-50 -mx-8 px-8 py-6 border-t border-gray-200">
                    {/* Error message display */}
                    {error && (
                      <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-start">
                        <svg
                          className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="flex gap-4 justify-end">
                      {/* Cancel Button */}
                      <button
                        type="button"
                        onClick={closeModal}
                        disabled={isSubmitting}
                        className={`px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold transition-all duration-200 ${
                          isSubmitting
                            ? "opacity-70 cursor-not-allowed"
                            : "hover:bg-gray-100 hover:border-gray-400"
                        }`}
                      >
                        Cancel
                      </button>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-6 py-3 bg-black text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform ${
                          isSubmitting
                            ? "opacity-70 cursor-not-allowed"
                            : "hover:-translate-y-0.5 hover:bg-gray-800"
                        }`}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            {editingVenue ? "Updating..." : "Creating..."}
                          </span>
                        ) : (
                          <span className="flex items-center">
                            {editingVenue ? (
                              <>
                                <FaSave className="mr-2" />
                                Update Venue
                              </>
                            ) : (
                              <>
                                <FaPlus className="mr-2" />
                                Create Venue
                              </>
                            )}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      <VOFooter />
    </>
  );
};

export default ManageVenues;
