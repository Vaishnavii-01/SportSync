import { useState, useEffect, useCallback } from "react";
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
  FaTable,
} from "react-icons/fa";
import {
  getVenues,
  createVenue,
  updateVenue,
  deleteVenue,
} from "../../services/venueService";
import {
  createSection,
  getVenueSections,
  createOrUpdateSlotSettings,
  getSlotSettings,
} from "../../services/sectionService";

// Utility function to generate available timings
const generateAvailableTimings = (
  openingTime: string,
  closingTime: string,
  ownerBlockedTime: string[],
  maintenanceTime: string[],
  minimumDuration: number,
  slotDuration: number
): TimingSlot[] => {
  const timings: TimingSlot[] = [];
  const [openHour, openMin] = openingTime.split(":").map(Number);
  const [closeHour, closeMin] = closingTime.split(":").map(Number);
  let currentTime = new Date();
  currentTime.setHours(openHour, openMin, 0, 0);
  const endTime = new Date();
  endTime.setHours(closeHour, closeMin, 0, 0);

  const blockedTimes = [...ownerBlockedTime, ...maintenanceTime].map((range) => {
    const [start, end] = range.split("-").map((t) => {
      const [h, m] = t.split(":").map(Number);
      const date = new Date();
      date.setHours(h, m, 0, 0);
      return date;
    });
    return { start, end };
  });

  while (currentTime < endTime) {
    const slotEndTime = new Date(currentTime);
    slotEndTime.setMinutes(currentTime.getMinutes() + slotDuration);

    if (slotEndTime > endTime) break;

    const isBlocked = blockedTimes.some(
      (block) => currentTime >= block.start && slotEndTime <= block.end
    );

    if (!isBlocked && slotDuration >= minimumDuration) {
      timings.push({
        startTime: currentTime.toTimeString().slice(0, 5),
        endTime: slotEndTime.toTimeString().slice(0, 5),
      });
    }

    currentTime.setMinutes(currentTime.getMinutes() + slotDuration);
  }

  return timings;
};

// Interfaces
interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  coordinates?: { lat: number; lng: number };
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

interface Section {
  _id: string;
  name: string;
  sport: string;
  priceModel: string;
  basePrice: number;
  capacity: number;
  description?: string;
  minimumDuration: number;
  ownerBlockedTime: string[];
  maintenanceTime: string[];
  images: string[];
  rules: string[];
}

interface TimingSlot {
  startTime: string;
  endTime: string;
}

interface SlotSettings {
  _id: string;
  venue: string;
  section: string;
  startDate?: string;
  endDate?: string;
  days: string[];
  timings: TimingSlot[];
  duration: number;
  bookingAllowed: number;
}

const VenueCard = ({
  venue,
  onEdit,
  onDelete,
  onManageSections,
}: {
  venue: Venue;
  onEdit: (venue: Venue) => void;
  onDelete: (id: string) => void;
  onManageSections: (id: string) => void;
}) => {
  const formatAddress = (address: Address) => `${address.city}, ${address.state}`;

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 text-center">
        <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-200">
          ⚽
        </div>
        <h3 className="text-xl font-bold text-black mb-2">{venue.name}</h3>
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
        <button
          onClick={() => onManageSections(venue._id)}
          className="mt-4 px-4 py-2 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
        >
          Manage Sections
        </button>
      </div>

      <div className="flex-1 p-6 space-y-4">
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
          {venue.description}
        </p>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-gray-600">
            <FaMapMarkerAlt className="text-gray-500 text-sm" />
            <span className="text-sm font-medium">{formatAddress(venue.address)}</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-600">
            <FaClock className="text-gray-500 text-sm" />
            <span className="text-sm">{venue.openingTime} - {venue.closingTime}</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-600">
            <FaPhone className="text-gray-500 text-sm" />
            <span className="text-sm font-medium">{venue.contactNumber}</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${venue.isActive ? "bg-green-500" : "bg-red-500"}`}
            />
            <span
              className={`text-sm font-medium ${venue.isActive ? "text-green-700" : "text-red-700"}`}
            >
              {venue.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(venue)}
              className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit venue"
            >
              <FaEdit className="text-sm" />
            </button>
            <button
              onClick={() => onDelete(venue._id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete venue"
            >
              <FaTrash className="text-sm" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const VenueFormModal = ({
  editingVenue,
  onSubmit,
  onClose,
  isSubmitting,
  error,
}: {
  editingVenue: Venue | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  isSubmitting: boolean;
  error: string | null;
}) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-[#FFFFF8] rounded-3xl max-w-4xl w-full max-h-[90vh] shadow-2xl border border-gray-300">
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
                {editingVenue ? "Update venue information and settings" : "Create a new venue for your platform"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-xl hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <div className="overflow-y-auto max-h-[calc(90vh-240px)]">
        <form onSubmit={onSubmit} className="px-8 py-8 space-y-10">
          <div className="space-y-6">
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <FaChartBar className="text-black text-sm" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-black">Basic Information</h3>
                <p className="text-sm text-gray-600">Essential details about your venue</p>
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
                  Sports Available <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="sports"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  placeholder="Football, Cricket, Basketball"
                  defaultValue={editingVenue?.sports.join(", ") || ""}
                />
                <p className="text-xs text-gray-500">Separate multiple sports with commas</p>
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
          <div className="space-y-6">
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <FaMapMarkerAlt className="text-black text-sm" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-black">Location Information</h3>
                <p className="text-sm text-gray-600">Where your venue is located</p>
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
          <div className="space-y-6">
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <FaPhone className="text-black text-sm" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-black">Contact & Hours</h3>
                <p className="text-sm text-gray-600">How customers can reach you</p>
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
                  pattern="\+?[1-9]\d{1,14}"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  placeholder="+91 9876543210"
                  defaultValue={editingVenue?.contactNumber || ""}
                />
                <p className="text-xs text-gray-500">Enter a valid phone number (e.g., +919876543210)</p>
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
              <label className="block text-sm font-semibold text-gray-700">Venue Status</label>
              <select
                name="status"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                defaultValue={editingVenue?.isActive ? "true" : "false"}
              >
                <option value="true">🟢 Active - Available for bookings</option>
                <option value="false">🔴 Inactive - Temporarily unavailable</option>
              </select>
            </div>
          </div>
          <div className="bg-gray-50 -mx-8 px-8 py-6 border-t border-gray-200">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-start">
                <svg className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className={`px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold transition-all duration-200 ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-100 hover:border-gray-400"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 bg-black text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:-translate-y-0.5 hover:bg-gray-800"
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
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
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
);

const SectionFormModal = ({
  selectedVenueId,
  sections,
  onSubmit,
  onClose,
  onManageSlots,
  isSubmitting,
  error,
}: {
  selectedVenueId: string;
  sections: Section[];
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  onManageSlots: (sectionId: string) => void;
  isSubmitting: boolean;
  error: string | null;
}) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-[#FFFFF8] rounded-3xl max-w-4xl w-full max-h-[90vh] shadow-2xl border border-gray-300">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 rounded-t-3xl border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
              <FaTable className="text-black text-sm" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-black">Manage Sections</h2>
              <p className="text-gray-600 text-sm">Add or view sections for this venue</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-xl hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <div className="overflow-y-auto max-h-[calc(90vh-240px)]">
        <div className="px-8 py-8 space-y-10">
          <div className="space-y-6">
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <FaTable className="text-black text-sm" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-black">Add New Section</h3>
                <p className="text-sm text-gray-600">Create a new section for this venue</p>
              </div>
            </div>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Section Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="sectionName"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    placeholder="Enter section name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Sport <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="sport"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    placeholder="e.g., Football"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Price Model <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="priceModel"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  >
                    <option value="perHour">Per Hour</option>
                    <option value="perSession">Per Session</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Base Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="basePrice"
                    required
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    placeholder="Enter base price"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Capacity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="capacity"
                  required
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  placeholder="Enter capacity"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Minimum Duration (minutes) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="minimumDuration"
                  required
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  placeholder="Enter minimum duration (e.g., 30)"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Owner Blocked Time</label>
                <input
                  type="text"
                  name="ownerBlockedTime"
                  pattern="(\d{2}:\d{2}-\d{2}:\d{2}(;\d{2}:\d{2}-\d{2}:\d{2})*)?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  placeholder="e.g., 09:00-10:00;13:00-14:00"
                />
                <p className="text-xs text-gray-500">Separate time ranges with semicolons (e.g., 09:00-10:00;13:00-14:00)</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Maintenance Time</label>
                <input
                  type="text"
                  name="maintenanceTime"
                  pattern="(\d{2}:\d{2}-\d{2}:\d{2}(;\d{2}:\d{2}-\d{2}:\d{2})*)?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  placeholder="e.g., 14:00-15:00;18:00-19:00"
                />
                <p className="text-xs text-gray-500">Separate time ranges with semicolons (e.g., 14:00-15:00;18:00-19:00)</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Description</label>
                <textarea
                  name="description"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white resize-none"
                  rows={4}
                  placeholder="Describe the section"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Images</label>
                <input
                  type="text"
                  name="images"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  placeholder="Enter image URLs, separated by commas"
                />
                <p className="text-xs text-gray-500">Separate multiple image URLs with commas</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Rules</label>
                <input
                  type="text"
                  name="rules"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  placeholder="Enter rules, separated by commas"
                />
                <p className="text-xs text-gray-500">Separate multiple rules with commas</p>
              </div>
              <div className="bg-gray-50 -mx-8 px-8 py-6 border-t border-gray-200">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-start">
                    <svg className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}
                <div className="flex gap-4 justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className={`px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold transition-all duration-200 ${
                      isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-100 hover:border-gray-400"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-3 bg-black text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform ${
                      isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:-translate-y-0.5 hover:bg-gray-800"
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
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Creating...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <FaPlus className="mr-2" />
                        Create Section
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </form>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black">Existing Sections</h3>
              {sections.length === 0 ? (
                <p className="text-gray-500">No sections found for this venue.</p>
              ) : (
                <div className="space-y-4">
                  {sections.map((section) => (
                    <div
                      key={section._id}
                      className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between items-center"
                    >
                      <div>
                        <h4 className="text-md font-medium text-black">{section.name}</h4>
                        <p className="text-sm text-gray-600">
                          Sport: {section.sport} | Price: {section.basePrice} ({section.priceModel}) | Capacity: {section.capacity} | Min Duration: {section.minimumDuration} min
                        </p>
                      </div>
                      <button
                        onClick={() => onManageSlots(section._id)}
                        className="px-4 py-2 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                      >
                        Manage Slots
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SlotSettingsFormModal = ({
  selectedVenueId,
  selectedSectionId,
  venues,
  sections,
  slotSettings,
  onSubmit,
  onClose,
  isSubmitting,
  error,
}: {
  selectedVenueId: string;
  selectedSectionId: string;
  venues: Venue[];
  sections: Section[];
  slotSettings: SlotSettings | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  isSubmitting: boolean;
  error: string | null;
}) => {
  const venue = venues.find((v) => v._id === selectedVenueId);
  const section = sections.find((s) => s._id === selectedSectionId);
  const [duration, setDuration] = useState(slotSettings?.duration || 60);

  const generatedTimings = useCallback(() => {
    if (!venue || !section) return [];
    return generateAvailableTimings(
      venue.openingTime,
      venue.closingTime,
      section.ownerBlockedTime,
      section.maintenanceTime,
      section.minimumDuration,
      duration
    );
  }, [venue, section, duration]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFFFF8] rounded-3xl max-w-4xl w-full max-h-[90vh] shadow-2xl border border-gray-300">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 rounded-t-3xl border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                <FaClock className="text-black text-sm" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black">Manage Slot Settings</h2>
                <p className="text-gray-600 text-sm">Configure available timings for this section</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-xl hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-240px)]">
          <form onSubmit={onSubmit} className="px-8 py-8 space-y-10">
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <FaClock className="text-black text-sm" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black">Slot Settings</h3>
                  <p className="text-sm text-gray-600">Define availability and slot duration</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    defaultValue={slotSettings?.startDate || ""}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    defaultValue={slotSettings?.endDate || ""}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Days <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="days"
                  required
                  pattern="(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)(,(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday))*"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  placeholder="Monday,Tuesday,Wednesday"
                  defaultValue={slotSettings?.days.join(",") || ""}
                />
                <p className="text-xs text-gray-500">Separate days with commas (e.g., Monday,Tuesday)</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Slot Duration (minutes) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="duration"
                  required
                  min={section?.minimumDuration || 1}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  placeholder="60"
                  defaultValue={slotSettings?.duration || ""}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Max Bookings Allowed <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="bookingAllowed"
                  required
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  placeholder="10"
                  defaultValue={slotSettings?.bookingAllowed || ""}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Available Timings (Generated)</label>
                <input
                  type="text"
                  name="timings"
                  readOnly
                  value={generatedTimings().map((t) => `${t.startTime}-${t.endTime}`).join(";") || ""}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500">Timings are auto-generated based on venue and section constraints.</p>
              </div>
            </div>
            <div className="bg-gray-50 -mx-8 px-8 py-6 border-t border-gray-200">
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-start">
                  <svg className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className={`px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold transition-all duration-200 ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-100 hover:border-gray-400"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-3 bg-black text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:-translate-y-0.5 hover:bg-gray-800"
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
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <FaSave className="mr-2" />
                      Save Slot Settings
                    </span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ManageVenues = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isSubmittingVenue, setIsSubmittingVenue] = useState(false);
  const [isSubmittingSection, setIsSubmittingSection] = useState(false);
  const [isSubmittingSlotSettings, setIsSubmittingSlotSettings] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showSlotSettingsModal, setShowSlotSettingsModal] = useState(false);
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [slotSettings, setSlotSettings] = useState<SlotSettings | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

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

  const fetchSections = useCallback(async (venueId: string) => {
    try {
      const data = await getVenueSections(venueId);
      setSections(data);
    } catch (err) {
      setError("Failed to fetch sections");
      console.error(err);
    }
  }, []);

  const handleAddSection = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingSection(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const sectionData = {
      name: formData.get("sectionName") as string,
      venue: selectedVenueId!,
      sport: formData.get("sport") as string,
      priceModel: formData.get("priceModel") as string,
      basePrice: parseFloat(formData.get("basePrice") as string),
      capacity: parseInt(formData.get("capacity") as string),
      description: formData.get("description") as string,
      minimumDuration: parseInt(formData.get("minimumDuration") as string),
      ownerBlockedTime: (formData.get("ownerBlockedTime") as string)?.split(";").map((t) => t.trim()).filter(Boolean) || [],
      maintenanceTime: (formData.get("maintenanceTime") as string)?.split(";").map((t) => t.trim()).filter(Boolean) || [],
      images: (formData.get("images") as string)?.split(",").map((s) => s.trim()).filter(Boolean) || [],
      rules: (formData.get("rules") as string)?.split(",").map((s) => s.trim()).filter(Boolean) || [],
    };

    try {
      await createSection(sectionData);
      await fetchSections(selectedVenueId!);
      setShowSectionModal(false);
    } catch (err) {
      setError(`Failed to create section: ${(err as Error).message}`);
      console.error(err);
    } finally {
      setIsSubmittingSection(false);
    }
  };

  const handleAddOrUpdateSlotSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingSlotSettings(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const slotSettingsData = {
      venueId: selectedVenueId!,
      sectionId: selectedSectionId!,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      days: (formData.get("days") as string)?.split(",").map((d) => d.trim()).filter(Boolean) || [],
      duration: parseInt(formData.get("duration") as string) || 60,
      bookingAllowed: parseInt(formData.get("bookingAllowed") as string) || 1,
      timings: [] as TimingSlot[],
    };

    const venue = venues.find((v) => v._id === selectedVenueId);
    const section = sections.find((s) => s._id === selectedSectionId);
    if (venue && section) {
      slotSettingsData.timings = generateAvailableTimings(
        venue.openingTime,
        venue.closingTime,
        section.ownerBlockedTime,
        section.maintenanceTime,
        section.minimumDuration,
        slotSettingsData.duration
      );
    } else {
      setError("Venue or section not found");
      setIsSubmittingSlotSettings(false);
      return;
    }

    try {
      await createOrUpdateSlotSettings(slotSettingsData);
      setShowSlotSettingsModal(false);
    } catch (err) {
      setError(`Failed to manage slot settings: ${(err as Error).message}`);
      console.error(err);
    } finally {
      setIsSubmittingSlotSettings(false);
    }
  };

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
    setIsSubmittingVenue(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const venueData = {
      name: formData.get("venueName") as string,
      description: formData.get("description") as string,
      sports: (formData.get("sports") as string).split(",").map((s: string) => s.trim()).filter(Boolean),
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
        setVenues(venues.map((v) => (v._id === editingVenue._id ? updatedVenue : v)));
      } else {
        const newVenue = await createVenue(venueData);
        setVenues([...venues, newVenue]);
      }
      setShowAddModal(false);
      setEditingVenue(null);
    } catch (err) {
      setError(editingVenue ? "Failed to update venue" : "Failed to create venue");
      console.error(err);
    } finally {
      setIsSubmittingVenue(false);
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

  const handleOpenSectionModal = (venueId: string) => {
    setSelectedVenueId(venueId);
    fetchSections(venueId);
    setShowSectionModal(true);
  };

  const handleOpenSlotSettingsModal = async (venueId: string, sectionId: string) => {
    setSelectedVenueId(venueId);
    setSelectedSectionId(sectionId);
    try {
      const data = await getSlotSettings(sectionId);
      setSlotSettings(data);
    } catch (err) {
      setSlotSettings(null);
      setError("Failed to fetch slot settings");
      console.error(err);
    }
    setShowSlotSettingsModal(true);
  };

  const closeVenueModal = () => {
    setShowAddModal(false);
    setEditingVenue(null);
    setError(null);
  };

  const closeSectionModal = () => {
    setShowSectionModal(false);
    setSelectedVenueId(null);
    setSections([]);
    setError(null);
  };

  const closeSlotSettingsModal = () => {
    setShowSlotSettingsModal(false);
    setSelectedVenueId(null);
    setSelectedSectionId(null);
    setSlotSettings(null);
    setError(null);
  };

  const activeVenues = venues.filter((v) => v.isActive).length;
  const multiSportVenues = venues.filter((v) => v.sports.length > 1).length;

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
                      viewMode === "grid" ? "bg-white text-black shadow-sm" : "text-gray-300 hover:text-white"
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === "list" ? "bg-white text-black shadow-sm" : "text-gray-300 hover:text-white"
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

        <div className="px-6 sm:px-12 lg:px-20 -mt-8 mb-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Total Venues", value: venues.length, icon: FaChartBar, color: "bg-gray-100" },
                { title: "Active Locations", value: activeVenues, icon: FaEye, color: "bg-gray-100" },
                { title: "Contact Provided", value: venues.length, icon: FaPhone, color: "bg-gray-100" },
                { title: "Multi-Sport", value: multiSportVenues, icon: FaUsers, color: "bg-gray-100" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-black">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="text-black text-xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-12 lg:px-20 pb-16">
          <div className="max-w-7xl mx-auto">
            {venues.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🏟️</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No venues found</h3>
                <p className="text-gray-500 mb-6">Get started by adding your first venue</p>
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
                className={`gap-6 ${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "flex flex-col"}`}
              >
                {venues.map((venue) => (
                  <VenueCard
                    key={venue._id}
                    venue={venue}
                    onEdit={handleEditVenue}
                    onDelete={handleDeleteVenue}
                    onManageSections={handleOpenSectionModal}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {showAddModal && (
          <VenueFormModal
            editingVenue={editingVenue}
            onSubmit={handleSubmitVenue}
            onClose={closeVenueModal}
            isSubmitting={isSubmittingVenue}
            error={error}
          />
        )}

        {showSectionModal && selectedVenueId && (
          <SectionFormModal
            selectedVenueId={selectedVenueId}
            sections={sections}
            onSubmit={handleAddSection}
            onClose={closeSectionModal}
            onManageSlots={(sectionId) => handleOpenSlotSettingsModal(selectedVenueId, sectionId)}
            isSubmitting={isSubmittingSection}
            error={error}
          />
        )}

        {showSlotSettingsModal && selectedVenueId && selectedSectionId && (
          <SlotSettingsFormModal
            selectedVenueId={selectedVenueId}
            selectedSectionId={selectedSectionId}
            venues={venues}
            sections={sections}
            slotSettings={slotSettings}
            onSubmit={handleAddOrUpdateSlotSettings}
            onClose={closeSlotSettingsModal}
            isSubmitting={isSubmittingSlotSettings}
            error={error}
          />
        )}

        <VOFooter />
      </div>
    </>
  );
};

export default ManageVenues;