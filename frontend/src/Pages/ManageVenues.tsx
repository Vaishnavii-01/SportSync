import React, { useState } from "react";
import VOFooter from "../Components/Footer/VOFooter";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaMapMarkerAlt,
  FaClock,
  FaRupeeSign,
  FaStar,
  FaUsers,
} from "react-icons/fa";

interface Venue {
  id: string;
  name: string;
  type: string;
  location: string;
  hourlyRate: number;
  rating: number;
  capacity: number;
  amenities: string[];
  status: "Active" | "Inactive";
  image: string;
}

const ManageVenues = () => {
  const [venues, setVenues] = useState<Venue[]>([
    {
      id: "V001",
      name: "VESIT Turf",
      type: "Football Turf",
      location: "Chembur, Mumbai",
      hourlyRate: 2500,
      rating: 4.8,
      capacity: 22,
      amenities: ["Floodlights", "Parking", "Changing Room"],
      status: "Active",
      image: "🏟️",
    },
    {
      id: "V002",
      name: "Elite Pool",
      type: "Swimming Pool",
      location: "Powai, Mumbai",
      hourlyRate: 1500,
      rating: 4.6,
      capacity: 50,
      amenities: ["Lifeguard", "Lockers", "Shower"],
      status: "Active",
      image: "🏊",
    },
    {
      id: "V003",
      name: "City Basketball Court",
      type: "Basketball Court",
      location: "Andheri, Mumbai",
      hourlyRate: 1200,
      rating: 4.3,
      capacity: 10,
      amenities: ["Scoreboard", "Seating", "Water Station"],
      status: "Inactive",
      image: "🏀",
    },
    {
      id: "V004",
      name: "Champions Cricket Ground",
      type: "Cricket Ground",
      location: "Thane, Mumbai",
      hourlyRate: 3500,
      rating: 4.9,
      capacity: 30,
      amenities: ["Pavilion", "Nets", "Equipment", "Parking"],
      status: "Active",
      image: "🏏",
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);

  const handleDeleteVenue = (id: string) => {
    if (window.confirm("Are you sure you want to delete this venue?")) {
      setVenues(venues.filter((venue) => venue.id !== id));
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
  };

  const activeVenues = venues.filter((v) => v.status === "Active").length;
  const totalRevenue = venues.reduce(
    (sum, venue) => sum + venue.hourlyRate * 8,
    0
  ); // Assuming 8 hours average per day
  const avgRating =
    venues.reduce((sum, venue) => sum + venue.rating, 0) / venues.length;

  return (
    <>
      <div className="bg-[#FFFFF8] min-h-screen">
        {/* Header Section */}
        <div className="px-6 sm:px-20 pt-8 pb-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Manage Venues
              </h1>
              <p className="text-gray-600">
                Oversee and manage all your venue locations
              </p>
            </div>
            <button
              onClick={handleAddVenue}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 shadow-md transition-colors"
            >
              <FaPlus />
              Add New Venue
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
            <div className="bg-white shadow-md rounded-lg text-center py-6">
              <div className="text-2xl font-bold text-gray-800">
                {venues.length}
              </div>
              <p className="text-sm text-gray-600 mt-2">Total Venues</p>
            </div>
            <div className="bg-white shadow-md rounded-lg text-center py-6">
              <div className="text-2xl font-bold text-green-600">
                {activeVenues}
              </div>
              <p className="text-sm text-gray-600 mt-2">Active Venues</p>
            </div>
            <div className="bg-white shadow-md rounded-lg text-center py-6">
              <div className="text-2xl font-bold text-gray-800">
                {avgRating.toFixed(1)}
              </div>
              <p className="text-sm text-gray-600 mt-2">Average Rating</p>
            </div>
            <div className="bg-white shadow-md rounded-lg text-center py-6">
              <div className="text-2xl font-bold text-gray-800">
                ₹{totalRevenue.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 mt-2">Daily Potential</p>
            </div>
          </div>
        </div>

        {/* Venues Grid */}
        <div className="px-6 sm:px-20 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue) => (
              <div
                key={venue.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Venue Card Header */}
                <div className="bg-[#fffaf4] p-6 text-center">
                  <div className="text-4xl mb-3">{venue.image}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    {venue.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{venue.type}</p>
                </div>

                {/* Venue Details */}
                <div className="p-6">
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaMapMarkerAlt className="text-red-500" />
                      <span className="text-sm">{venue.location}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <FaRupeeSign className="text-green-500" />
                      <span className="text-sm">₹{venue.hourlyRate}/hour</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <FaStar className="text-yellow-500" />
                      <span className="text-sm">{venue.rating} rating</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <FaUsers className="text-blue-500" />
                      <span className="text-sm">
                        Capacity: {venue.capacity}
                      </span>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Amenities:</p>
                    <div className="flex flex-wrap gap-1">
                      {venue.amenities.slice(0, 3).map((amenity, index) => (
                        <span
                          key={index}
                          className="bg-[#ffecec] text-xs px-2 py-1 rounded text-gray-700"
                        >
                          {amenity}
                        </span>
                      ))}
                      {venue.amenities.length > 3 && (
                        <span className="bg-gray-100 text-xs px-2 py-1 rounded text-gray-600">
                          +{venue.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mb-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        venue.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {venue.status}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditVenue(venue)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#ffecec] text-gray-700 rounded-lg font-medium hover:bg-[#f7dbdb] transition-colors"
                    >
                      <FaEdit className="text-sm" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteVenue(venue.id)}
                      className="flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-90vh overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  {editingVenue ? "Edit Venue" : "Add New Venue"}
                </h2>

                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Venue Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="Enter venue name"
                      defaultValue={editingVenue?.name || ""}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Venue Type
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500">
                      <option value="">Select venue type</option>
                      <option value="Football Turf">Football Turf</option>
                      <option value="Swimming Pool">Swimming Pool</option>
                      <option value="Basketball Court">Basketball Court</option>
                      <option value="Cricket Ground">Cricket Ground</option>
                      <option value="Tennis Court">Tennis Court</option>
                      <option value="Badminton Court">Badminton Court</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="Enter location"
                      defaultValue={editingVenue?.location || ""}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hourly Rate (₹)
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="Enter hourly rate"
                      defaultValue={editingVenue?.hourlyRate || ""}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacity
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="Maximum capacity"
                      defaultValue={editingVenue?.capacity || ""}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                      defaultValue={editingVenue?.status || "Active"}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </form>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                  >
                    {editingVenue ? "Update Venue" : "Add Venue"}
                  </button>
                </div>
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
