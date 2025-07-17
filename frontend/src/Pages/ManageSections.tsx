import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VOFooter from "../Components/Footer/VOFooter";
import VenueNavbar from "../Components/Navbar/VenueNavbar";
import {
  FaPlus,
  FaClock,
  FaArrowLeft,
  FaSave,
  FaTrash,
  FaEdit,
  FaBan,
} from "react-icons/fa";
import {
  createSection,
  getVenueSections,
  getSectionById,
  updateSection,
  deleteSection,
  createSlotSettings,
  updateSlotSettings,
  deleteSlotSettings,
  getSlotSettings,
  saveBlockedSlots,
  getBlockedSettings,
  updateBlockedSettings,
  deleteBlockedSettings,
} from "../../services/sectionService";
import { getVenueById } from "../../services/venueService";

// Define interfaces
interface Section {
  _id: string;
  name: string;
  venue: string;
  sport: string;
  capacity: number;
  description?: string;
  images: string[];
  rules: string[];
  isActive: boolean;
}

interface TimingSlot {
  startTime: string;
  endTime: string;
}

interface SlotSettings {
  _id: string;
  venue: string;
  section: string;
  name: string;
  startDate?: string;
  endDate?: string;
  days: string[];
  timings: TimingSlot[];
  duration: number;
  price: number;
  customDayPrice: { day: string; price: number }[];
  maxAdvanceBooking: number;
  isActive: boolean;
}

interface BlockedSlot {
  _id: string;
  name: string;
  venue: string;
  section: string;
  startDate?: string;
  endDate?: string;
  days: string[];
  timings: TimingSlot[];
  reason: string;
  isActive: boolean;
}

interface Venue {
  _id: string;
  name: string;
  openingTime: string;
  closingTime: string;
  sports: string[];
}

interface AppError {
  message: string;
  status?: number;
}

// SectionCard component - Updated with CODE 2 styling
const SectionCard = ({
  section,
  onManageSlots,
  onEdit,
  onDelete,
  onBlockedSlots,
}: {
  section: Section;
  onManageSlots: (sectionId: string) => void;
  onEdit: (section: Section) => void;
  onDelete: (sectionId: string) => void;
  onBlockedSlots: (sectionId: string) => void;
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          {/* Section Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 mb-2 break-words">
              {section.name}
            </h3>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                {section.sport}
              </span>
            </div>
            <div className="flex items-center space-x-1.5 mb-4">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  section.isActive ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  section.isActive ? "text-green-700" : "text-red-700"
                }`}
              >
                {section.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => onEdit(section)}
                className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors flex items-center justify-center"
                aria-label="Edit section"
              >
                <FaEdit className="text-sm" />
              </button>
              <button
                onClick={() => onDelete(section._id)}
                className="p-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-colors flex items-center justify-center"
                aria-label="Delete section"
              >
                <FaTrash className="text-sm" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onManageSlots(section._id)}
                className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl font-medium transition-colors flex items-center justify-center"
              >
                <span>Manage Slots</span>
              </button>
              <button
                onClick={() => onBlockedSlots(section._id)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center"
              >
                <span>Blocked Slots</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// SectionFormModal - Updated with CODE 2 styling
const SectionFormModal = ({
  venue,
  section,
  onSubmit,
  onClose,
  isSubmitting,
  error,
  isEditMode,
}: {
  venue: Venue;
  section?: Section;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onClose: () => void;
  isSubmitting: boolean;
  error: string | null;
  isEditMode?: boolean;
}) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-[#FFFFF8] rounded-3xl max-w-4xl w-full max-h-[90vh] shadow-2xl border border-gray-300">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 rounded-t-3xl border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
              <FaPlus className="text-black text-sm" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-black">
                {isEditMode ? "Edit Section" : "Add New Section"}
              </h2>
              <p className="text-gray-600 text-sm">
                {isEditMode
                  ? `Update details for ${section?.name}`
                  : `Create a new section for ${venue.name}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
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
      <div className="overflow-y-auto max-h-[calc(90vh-240px)]">
        <form onSubmit={onSubmit} className="px-8 py-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Section Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                defaultValue={section?.name || ""}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                placeholder="Enter section name"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Sport <span className="text-red-500">*</span>
              </label>
              <select
                name="sport"
                required
                defaultValue={section?.sport || ""}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
              >
                {venue.sports.map((sport) => (
                  <option key={sport} value={sport}>
                    {sport}
                  </option>
                ))}
              </select>
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
              defaultValue={section?.capacity || ""}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
              placeholder="Enter capacity"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              defaultValue={section?.description || ""}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white resize-none"
              rows={3}
              placeholder="Describe the section"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Images
            </label>
            <input
              type="text"
              name="images"
              defaultValue={section?.images.join(",") || ""}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
              placeholder="Enter image URLs, separated by commas"
            />
            <p className="text-xs text-gray-500">
              Separate multiple image URLs with commas
            </p>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Rules
            </label>
            <input
              type="text"
              name="rules"
              defaultValue={section?.rules.join(",") || ""}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
              placeholder="Enter rules, separated by commas"
            />
            <p className="text-xs text-gray-500">
              Separate multiple rules with commas
            </p>
          </div>
          <div className="bg-gray-50 -mx-8 px-8 py-6 border-t border-gray-200">
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
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className={`px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold transition-all duration-200 ${
                  isSubmitting
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-gray-100 hover:border-gray-400"
                }`}
              >
                Cancel
              </button>
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
                    {isEditMode ? "Updating..." : "Creating..."}
                  </span>
                ) : (
                  <span className="flex items-center">
                    <FaSave className="mr-2" />
                    {isEditMode ? "Update Section" : "Create Section"}
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

// SlotSettingsFormModal - Updated with CODE 2 styling
const SlotSettingsFormModal = ({
  venue,
  section,
  slotSettings,
  onSubmit,
  onClose,
  isSubmitting,
  error,
}: {
  venue: Venue;
  section: Section;
  slotSettings: SlotSettings | null;
  onSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    timings: TimingSlot[],
    customDayPrice: { day: string; price: number }[]
  ) => Promise<void>;
  onClose: () => void;
  isSubmitting: boolean;
  error: string | null;
}) => {
  const [timings, setTimings] = useState<TimingSlot[]>(
    slotSettings?.timings || [{ startTime: "", endTime: "" }]
  );
  const [duration, setDuration] = useState<number>(
    slotSettings?.duration || 60
  );
  const [name, setName] = useState<string>(slotSettings?.name || "");
  const [selectedDays, setSelectedDays] = useState<string[]>(
    slotSettings?.days || []
  );
  const [price, setPrice] = useState<number>(slotSettings?.price || 0);
  const [customDayPrice, setCustomDayPrice] = useState<
    { day: string; price: number }[]
  >(slotSettings?.customDayPrice || []);
  const [maxAdvanceBooking, setMaxAdvanceBooking] = useState<number>(
    slotSettings?.maxAdvanceBooking || 7
  );

  const daysOfWeek = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  const addTimingSlot = () => {
    setTimings([...timings, { startTime: "", endTime: "" }]);
  };

  const removeTimingSlot = (index: number) => {
    if (timings.length > 1) {
      setTimings(timings.filter((_, i) => i !== index));
    }
  };

  const updateTimingSlot = (
    index: number,
    field: keyof TimingSlot,
    value: string
  ) => {
    const newTimings = [...timings];
    newTimings[index][field] = value;
    setTimings(newTimings);
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const updateCustomDayPrice = (day: string, price: number) => {
    setCustomDayPrice((prev) => {
      const existing = prev.find((cdp) => cdp.day === day);
      if (existing) {
        return prev.map((cdp) => (cdp.day === day ? { ...cdp, price } : cdp));
      }
      return [...prev, { day, price }];
    });
  };

  const validateTimings = () => {
    return timings.every((t) => {
      if (!t.startTime || !t.endTime) return false;
      const [startHour, startMin] = t.startTime.split(":").map(Number);
      const [endHour, endMin] = t.endTime.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      return startMinutes < endMinutes;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateTimings()) {
      alert(
        "All timing slots must have valid start and end times (start < end)"
      );
      return;
    }
    if (selectedDays.length === 0) {
      alert("At least one day must be selected");
      return;
    }
    await onSubmit(e, timings, customDayPrice);
  };

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
                <h2 className="text-2xl font-bold text-black">
                  {slotSettings ? "Edit Slot Settings" : "Create Slot Settings"}
                </h2>
                <p className="text-gray-600 text-sm">
                  Configure available timings for {section.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
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
        <div className="overflow-y-auto max-h-[calc(90vh-240px)]">
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-10">
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <FaClock className="text-black text-sm" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black">
                    Slot Settings
                  </h3>
                  <p className="text-sm text-gray-600">
                    Define availability and slot duration
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  placeholder="Enter slot settings name"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    defaultValue={slotSettings?.startDate?.split("T")[0] || ""}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    defaultValue={slotSettings?.endDate?.split("T")[0] || ""}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Days <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {daysOfWeek.map((day) => (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-2 rounded-xl text-center text-sm font-medium ${
                        selectedDays.includes(day)
                          ? "bg-black text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                <input
                  type="hidden"
                  name="days"
                  value={selectedDays.join(",")}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Timing Slots <span className="text-red-500">*</span>
                </label>
                {timings.map((timing, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="time"
                      required
                      value={timing.startTime}
                      onChange={(e) =>
                        updateTimingSlot(index, "startTime", e.target.value)
                      }
                      className="w-1/2 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    />
                    <input
                      type="time"
                      required
                      value={timing.endTime}
                      onChange={(e) =>
                        updateTimingSlot(index, "endTime", e.target.value)
                      }
                      className="w-1/2 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    />
                    {timings.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTimingSlot(index)}
                        className="p-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTimingSlot}
                  className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Add Timing Slot
                </button>
                <p className="text-xs text-gray-500">
                  Add multiple time ranges for availability (e.g., 09:00-11:00,
                  17:00-18:00)
                </p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Slot Duration (minutes){" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="duration"
                  required
                  min="15"
                  max="480"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  placeholder="60"
                />
                <p className="text-xs text-gray-500">
                  Duration must be between 15 and 480 minutes
                </p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Base Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  placeholder="Enter base price"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Custom Day Prices
                </label>
                {daysOfWeek.map((day) => (
                  <div key={day} className="flex items-center space-x-2 mb-2">
                    <label className="w-20 text-sm text-gray-600">{day}</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Price"
                      value={
                        customDayPrice.find((cdp) => cdp.day === day)?.price ||
                        ""
                      }
                      onChange={(e) =>
                        updateCustomDayPrice(
                          day,
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>
                ))}
                <p className="text-xs text-gray-500">
                  Enter prices for specific days (leave blank to use base price)
                </p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Max Advance Booking (days){" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="maxAdvanceBooking"
                  required
                  min="1"
                  max="365"
                  value={maxAdvanceBooking}
                  onChange={(e) =>
                    setMaxAdvanceBooking(parseInt(e.target.value) || 7)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  placeholder="7"
                />
                <p className="text-xs text-gray-500">
                  Number of days in advance bookings are allowed (1-365)
                </p>
              </div>
            </div>
            <div className="bg-gray-50 -mx-8 px-8 py-6 border-t border-gray-200">
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
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className={`px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold transition-all duration-200 ${
                    isSubmitting
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:bg-gray-100 hover:border-gray-400"
                  }`}
                >
                  Cancel
                </button>
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
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <FaSave className="mr-2" />
                      {slotSettings
                        ? "Update Slot Settings"
                        : "Create Slot Settings"}
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

// BlockedSlotSettingsModal - Updated with CODE 2 styling
// ... (previous code remains unchanged) ...

// BlockedSlotSettingsModal - Updated with CODE 2 styling
const BlockedSlotSettingsModal = ({
  section,
  blockedSlot,
  onSubmit,
  onClose,
  isSubmitting,
  error,
}: {
  section: Section;
  blockedSlot?: BlockedSlot | null;
  onSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    timings: TimingSlot[]
  ) => Promise<void>;
  onClose: () => void;
  isSubmitting: boolean;
  error: string | null;
}) => {
  const [timings, setTimings] = useState<TimingSlot[]>(
    blockedSlot?.timings || []
  );
  const [name, setName] = useState<string>(blockedSlot?.name || "");
  const [startDate, setStartDate] = useState<string>(
    blockedSlot?.startDate?.split("T")[0] || ""
  );
  const [endDate, setEndDate] = useState<string>(
    blockedSlot?.endDate?.split("T")[0] || ""
  );
  const [days, setDays] = useState<string[]>(blockedSlot?.days || []);
  const [reason, setReason] = useState<string>(blockedSlot?.reason || "");

  const daysOfWeek = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  const addTimingSlot = () => {
    setTimings([...timings, { startTime: "", endTime: "" }]);
  };

  const removeTimingSlot = (index: number) => {
    setTimings(timings.filter((_, i) => i !== index));
  };

  const updateTimingSlot = (
    index: number,
    field: keyof TimingSlot,
    value: string
  ) => {
    const newTimings = [...timings];
    newTimings[index][field] = value;
    setTimings(newTimings);
  };

  const toggleDay = (day: string) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const validateTimings = () => {
    return timings.every((t) => {
      // Skip validation for completely empty slots
      if (!t.startTime && !t.endTime) return true;

      if (!t.startTime || !t.endTime) return false;
      const [startHour, startMin] = t.startTime.split(":").map(Number);
      const [endHour, endMin] = t.endTime.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      return startMinutes < endMinutes;
    });
  };

  const validateDates = () => {
    if (!startDate && !endDate) return true;
    if (startDate && endDate) {
      return new Date(startDate) <= new Date(endDate);
    }
    return false;
  };

  const isFormEmpty = () => {
    const hasNonEmptyTiming = timings.some((t) => t.startTime || t.endTime);
    return (
      !name &&
      !startDate &&
      !endDate &&
      days.length === 0 &&
      !hasNonEmptyTiming &&
      !reason
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check if at least one field is filled
    if (isFormEmpty()) {
      alert("Please fill at least one field to submit");
      return;
    }

    // Validate only if there are any timings with values
    if (!validateTimings()) {
      alert(
        "Timing slots must have valid start and end times (start < end) if provided"
      );
      return;
    }

    // Validate dates only if both are provided
    if (!validateDates()) {
      alert(
        "If dates are provided, both must be filled and start date must be before or equal to end date"
      );
      return;
    }

    await onSubmit(e, timings);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFFFF8] rounded-3xl max-w-4xl w-full max-h-[90vh] shadow-2xl border border-gray-300">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 rounded-t-3xl border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                <FaBan className="text-black text-sm" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black">
                  {blockedSlot
                    ? "Edit Blocked Slot Settings"
                    : "Create Blocked Slot Settings"}
                </h2>
                <p className="text-gray-600 text-sm">
                  Configure blocked time slots for {section.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
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
        <div className="overflow-y-auto max-h-[calc(90vh-240px)]">
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-10">
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <FaBan className="text-black text-sm" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black">
                    Blocked Time Slots
                  </h3>
                  <p className="text-sm text-gray-600">
                    Define unavailable time periods for this section
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  placeholder="Enter reason for blocking slots"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Days
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {daysOfWeek.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-2 rounded-xl text-center text-sm font-medium ${
                        days.includes(day)
                          ? "bg-red-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                <input type="hidden" name="days" value={days.join(",")} />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Blocked Time Slots
                </label>
                {timings.map((timing, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="time"
                      value={timing.startTime}
                      onChange={(e) =>
                        updateTimingSlot(index, "startTime", e.target.value)
                      }
                      className="w-1/2 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    />
                    <input
                      type="time"
                      value={timing.endTime}
                      onChange={(e) =>
                        updateTimingSlot(index, "endTime", e.target.value)
                      }
                      className="w-1/2 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeTimingSlot(index)}
                      className="p-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTimingSlot}
                  className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Add Time Slot
                </button>
                <p className="text-xs text-gray-500">
                  Add multiple time ranges to block (e.g., 14:00-16:00,
                  20:00-22:00)
                </p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Reason
                </label>
                <textarea
                  name="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white resize-none"
                  rows={3}
                  placeholder="Explain why these slots are blocked"
                />
              </div>
            </div>
            <div className="bg-gray-50 -mx-8 px-8 py-6 border-t border-gray-200">
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
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className={`px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold transition-all duration-200 ${
                    isSubmitting
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:bg-gray-100 hover:border-gray-400"
                  }`}
                >
                  Cancel
                </button>
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
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <FaSave className="mr-2" />
                      {blockedSlot
                        ? "Update Blocked Slots"
                        : "Save Blocked Slots"}
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

const SlotSettingsListModal = ({
  section,
  slotSettingsList,
  onCreate,
  onEdit,
  onDelete,
  onClose,
}: {
  section: Section;
  slotSettingsList: SlotSettings[];
  onCreate: () => void;
  onEdit: (slotSettings: SlotSettings) => void;
  onDelete: (slotSettingsId: string) => Promise<void>;
  onClose: () => void;
}) => {
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
                <h2 className="text-2xl font-bold text-black">
                  Slot Settings for {section.name}
                </h2>
                <p className="text-gray-600 text-sm">
                  Manage slot settings for this section
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
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
        <div className="overflow-y-auto max-h-[calc(90vh-240px)] px-8 py-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-black">
                Available Slot Settings
              </h3>
              <button
                onClick={onCreate}
                className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
              >
                <FaPlus className="text-sm" />
                <span>Create New</span>
              </button>
            </div>
            {slotSettingsList.length === 0 ? (
              <p className="text-gray-600">
                No slot settings found. Create one to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {slotSettingsList.map((settings) => (
                  <div
                    key={settings._id}
                    className="bg-white rounded-xl border border-gray-200 p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold text-black">
                        {settings.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Days: {settings.days.join(", ")}
                      </p>
                      <p className="text-sm text-gray-600">
                        Duration: {settings.duration} minutes
                      </p>
                      <p className="text-sm text-gray-600">
                        Base Price: ₹{settings.price}
                      </p>
                      <p className="text-sm text-gray-600">
                        Max Advance Booking: {settings.maxAdvanceBooking} days
                      </p>
                      <p className="text-sm text-gray-600">
                        Timings:{" "}
                        {settings.timings
                          .map((t) => `${t.startTime}-${t.endTime}`)
                          .join(", ")}
                      </p>
                      {settings.startDate && (
                        <p className="text-sm text-gray-600">
                          Start Date:{" "}
                          {new Date(settings.startDate).toLocaleDateString()}
                        </p>
                      )}
                      {settings.endDate && (
                        <p className="text-sm text-gray-600">
                          End Date:{" "}
                          {new Date(settings.endDate).toLocaleDateString()}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        Status: {settings.isActive ? "Active" : "Inactive"}
                      </p>
                      {settings.customDayPrice.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-700">
                            Custom Prices:
                          </p>
                          <ul className="text-sm text-gray-600">
                            {settings.customDayPrice.map((price, idx) => (
                              <li key={idx}>
                                {price.day}: ₹{price.price}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit(settings)}
                        className="p-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => onDelete(settings._id)}
                        className="p-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-gray-50 -mx-8 px-8 py-6 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// BlockedSettingsListModal - Updated with CODE 2 styling
const BlockedSettingsListModal = ({
  section,
  blockedSettingsList,
  onCreate,
  onEdit,
  onDelete,
  onClose,
}: {
  section: Section;
  blockedSettingsList: BlockedSlot[];
  onCreate: () => void;
  onEdit: (blockedSlot: BlockedSlot) => void;
  onDelete: (blockedSettingsId: string) => Promise<void>;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFFFF8] rounded-3xl max-w-4xl w-full max-h-[90vh] shadow-2xl border border-gray-300">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 rounded-t-3xl border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                <FaBan className="text-black text-sm" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black">
                  Blocked Settings for {section.name}
                </h2>
                <p className="text-gray-600 text-sm">
                  Manage blocked time slots for this section
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
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
        <div className="overflow-y-auto max-h-[calc(90vh-240px)] px-8 py-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-black">
                Blocked Time Slots
              </h3>
              <button
                onClick={onCreate}
                className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
              >
                <FaPlus className="text-sm" />
                <span>Create New</span>
              </button>
            </div>
            {blockedSettingsList.length === 0 ? (
              <p className="text-gray-600">
                No blocked settings found. Create one to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {blockedSettingsList.map((settings) => (
                  <div
                    key={settings._id}
                    className="bg-white rounded-xl border border-gray-200 p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold text-black">
                        {settings.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Days: {settings.days.join(", ")}
                      </p>
                      <p className="text-sm text-gray-600">
                        Timings:{" "}
                        {settings.timings
                          .map((t) => `${t.startTime}-${t.endTime}`)
                          .join(", ")}
                      </p>
                      <p className="text-sm text-gray-600">
                        Start Date:{" "}
                        {new Date(settings.startDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        End Date:{" "}
                        {new Date(settings.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Reason: {settings.reason}
                      </p>
                      <p className="text-sm text-gray-600">
                        Status: {settings.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit(settings)}
                        className="p-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => onDelete(settings._id)}
                        className="p-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-gray-50 -mx-8 px-8 py-6 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main ManageSections component - Updated with CODE 2 styling
const ManageSections = () => {
  const { venueId } = useParams<{ venueId: string }>();
  const navigate = useNavigate();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showSlotSettingsListModal, setShowSlotSettingsListModal] =
    useState<boolean>(false);
  const [showSlotSettingsFormModal, setShowSlotSettingsFormModal] =
    useState<boolean>(false);
  const [showBlockedSettingsListModal, setShowBlockedSettingsListModal] =
    useState<boolean>(false);
  const [showBlockedSlotSettingsModal, setShowBlockedSlotSettingsModal] =
    useState<boolean>(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedSlotSettings, setSelectedSlotSettings] =
    useState<SlotSettings | null>(null);
  const [selectedBlockedSlot, setSelectedBlockedSlot] =
    useState<BlockedSlot | null>(null);
  const [slotSettingsList, setSlotSettingsList] = useState<SlotSettings[]>([]);
  const [blockedSettingsList, setBlockedSettingsList] = useState<BlockedSlot[]>(
    []
  );
  const [isSubmittingSection, setIsSubmittingSection] =
    useState<boolean>(false);
  const [isSubmittingSlotSettings, setIsSubmittingSlotSettings] =
    useState<boolean>(false);
  const [isSubmittingBlockedSlots, setIsSubmittingBlockedSlots] =
    useState<boolean>(false);

  const fetchVenueAndSections = useCallback(async () => {
    if (!venueId) {
      setError("Venue ID is missing");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [venueData, sectionsData] = await Promise.all([
        getVenueById(venueId),
        getVenueSections(venueId),
      ]);
      setVenue(venueData);
      setSections(sectionsData);
    } catch (err: unknown) {
      const appError = err as AppError;
      setError(appError.message || "Failed to fetch venue and sections");
      console.error("Fetch error:", appError);
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    fetchVenueAndSections();
  }, [fetchVenueAndSections]);

  const handleAddSection = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!venueId) {
      setError("Venue ID is missing");
      return;
    }
    setIsSubmittingSection(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name")?.toString();
    const sport = formData.get("sport")?.toString();
    const capacity = formData.get("capacity")?.toString();
    const description = formData.get("description")?.toString();
    const images = formData.get("images")?.toString();
    const rules = formData.get("rules")?.toString();

    if (!name || !sport || !capacity) {
      setError("Required fields are missing: name, sport, or capacity");
      setIsSubmittingSection(false);
      return;
    }

    const sectionData: Omit<Section, "_id"> = {
      name,
      venue: venueId,
      sport,
      capacity: parseInt(capacity),
      description: description?.trim() || undefined,
      images:
        images
          ?.split(",")
          .map((s) => s.trim())
          .filter(Boolean) || [],
      rules:
        rules
          ?.split(",")
          .map((s) => s.trim())
          .filter(Boolean) || [],
      isActive: true,
    };

    try {
      const newSection = await createSection(sectionData);
      setSections((prevSections) => [...prevSections, newSection]);
      setShowAddModal(false);
    } catch (err: unknown) {
      const appError = err as AppError;
      setError(appError.message || "Failed to create section");
      console.error("Create section error:", appError);
    } finally {
      setIsSubmittingSection(false);
    }
  };

  const handleEditSection = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!venueId || !selectedSection) {
      setError("Venue ID or section is missing");
      return;
    }
    setIsSubmittingSection(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name")?.toString();
    const sport = formData.get("sport")?.toString();
    const capacity = formData.get("capacity")?.toString();
    const description = formData.get("description")?.toString();
    const images = formData.get("images")?.toString();
    const rules = formData.get("rules")?.toString();

    if (!name || !sport || !capacity) {
      setError("Required fields are missing: name, sport, or capacity");
      setIsSubmittingSection(false);
      return;
    }

    const sectionData: Partial<Section> = {
      name,
      venue: venueId,
      sport,
      capacity: parseInt(capacity),
      description: description?.trim() || undefined,
      images:
        images
          ?.split(",")
          .map((s) => s.trim())
          .filter(Boolean) || [],
      rules:
        rules
          ?.split(",")
          .map((s) => s.trim())
          .filter(Boolean) || [],
      isActive: true,
    };

    try {
      const updatedSection = await updateSection(
        selectedSection._id,
        sectionData
      );
      setSections((prevSections) =>
        prevSections.map((s) =>
          s._id === selectedSection._id ? updatedSection : s
        )
      );
      setShowEditModal(false);
      setSelectedSection(null);
    } catch (err: unknown) {
      const appError = err as AppError;
      setError(appError.message || "Failed to update section");
      console.error("Update section error:", appError);
    } finally {
      setIsSubmittingSection(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!window.confirm("Are you sure you want to delete this section?"))
      return;
    setError(null);
    try {
      await deleteSection(sectionId);
      setSections((prevSections) =>
        prevSections.filter((s) => s._id !== sectionId)
      );
    } catch (err: unknown) {
      const appError = err as AppError;
      setError(appError.message || "Failed to delete section");
      console.error("Delete section error:", appError);
    }
  };

  const handleOpenSlotSettingsListModal = async (sectionId: string) => {
    setError(null);
    try {
      const section =
        sections.find((s) => s._id === sectionId) ||
        (await getSectionById(sectionId));
      if (!section) {
        throw new Error("Section not found");
      }
      setSelectedSection(section);
      const data = await getSlotSettings(sectionId);
      setSlotSettingsList(data);
      setShowSlotSettingsListModal(true);
    } catch (err: unknown) {
      const appError = err as AppError;
      setError(appError.message || "Failed to fetch slot settings");
      console.error("Fetch slot settings error:", appError);
    }
  };

  const handleOpenBlockedSettingsListModal = async (sectionId: string) => {
    setError(null);
    try {
      const section =
        sections.find((s) => s._id === sectionId) ||
        (await getSectionById(sectionId));
      if (!section) {
        throw new Error("Section not found");
      }
      setSelectedSection(section);
      const data = await getBlockedSettings(sectionId);
      setBlockedSettingsList(data);
      setShowBlockedSettingsListModal(true);
    } catch (err: unknown) {
      const appError = err as AppError;
      setError(appError.message || "Failed to fetch blocked settings");
      console.error("Fetch blocked settings error:", appError);
    }
  };

  const handleCreateSlotSettings = async (
    e: React.FormEvent<HTMLFormElement>,
    timings: TimingSlot[],
    customDayPrice: { day: string; price: number }[]
  ) => {
    e.preventDefault();
    if (!venueId || !selectedSection) {
      setError("Venue ID or section is missing");
      return;
    }
    setIsSubmittingSlotSettings(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name")?.toString();
    const startDate = formData.get("startDate")?.toString() || undefined;
    const endDate = formData.get("endDate")?.toString() || undefined;
    const days = formData.get("days")?.toString();
    const duration = formData.get("duration")?.toString();
    const price = formData.get("price")?.toString();
    const maxAdvanceBooking = formData.get("maxAdvanceBooking")?.toString();

    if (!name || !duration || !price || !maxAdvanceBooking || !days) {
      setError(
        "Required fields are missing: name, duration, price, maxAdvanceBooking, or days"
      );
      setIsSubmittingSlotSettings(false);
      return;
    }

    if (!timings.every((t) => t.startTime && t.endTime)) {
      setError("All timing slots must have valid start and end times");
      setIsSubmittingSlotSettings(false);
      return;
    }

    const slotSettingsData: Omit<SlotSettings, "_id"> = {
      name,
      venue: venueId,
      section: selectedSection._id,
      startDate,
      endDate,
      days: days
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean),
      timings,
      duration: parseInt(duration),
      price: parseFloat(price),
      customDayPrice: customDayPrice.filter((cdp) => cdp.price > 0),
      maxAdvanceBooking: parseInt(maxAdvanceBooking),
      isActive: true,
    };

    try {
      const newSlotSettings = await createSlotSettings(
        selectedSection._id,
        slotSettingsData
      );
      setSlotSettingsList((prev) => [...prev, newSlotSettings]);
      setShowSlotSettingsFormModal(false);
    } catch (err: unknown) {
      const appError = err as AppError;
      setError(appError.message || "Failed to create slot settings");
      console.error("Create slot settings error:", appError);
    } finally {
      setIsSubmittingSlotSettings(false);
    }
  };

  const handleUpdateSlotSettings = async (
    e: React.FormEvent<HTMLFormElement>,
    timings: TimingSlot[],
    customDayPrice: { day: string; price: number }[]
  ) => {
    e.preventDefault();
    if (!selectedSlotSettings || !selectedSection) {
      setError("Slot settings or section is missing");
      return;
    }
    setIsSubmittingSlotSettings(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name")?.toString();
    const startDate = formData.get("startDate")?.toString() || undefined;
    const endDate = formData.get("endDate")?.toString() || undefined;
    const days = formData.get("days")?.toString();
    const duration = formData.get("duration")?.toString();
    const price = formData.get("price")?.toString();
    const maxAdvanceBooking = formData.get("maxAdvanceBooking")?.toString();

    if (!name || !duration || !price || !maxAdvanceBooking || !days) {
      setError(
        "Required fields are missing: name, duration, price, maxAdvanceBooking, or days"
      );
      setIsSubmittingSlotSettings(false);
      return;
    }

    const slotSettingsData: Partial<SlotSettings> = {
      name,
      venue: venueId,
      section: selectedSection._id,
      startDate,
      endDate,
      days: days
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean),
      timings,
      duration: parseInt(duration),
      price: parseFloat(price),
      customDayPrice: customDayPrice.filter((cdp) => cdp.price > 0),
      maxAdvanceBooking: parseInt(maxAdvanceBooking),
      isActive: true,
    };

    try {
      const updatedSlotSettings = await updateSlotSettings(
        selectedSlotSettings._id,
        slotSettingsData
      );
      setSlotSettingsList((prev) =>
        prev.map((s) =>
          s._id === selectedSlotSettings._id ? updatedSlotSettings : s
        )
      );
      setShowSlotSettingsFormModal(false);
      setSelectedSlotSettings(null);
    } catch (err: unknown) {
      const appError = err as AppError;
      setError(appError.message || "Failed to update slot settings");
      console.error("Update slot settings error:", appError);
    } finally {
      setIsSubmittingSlotSettings(false);
    }
  };

  const handleDeleteSlotSettings = async (slotSettingsId: string) => {
    if (!window.confirm("Are you sure you want to delete this slot settings?"))
      return;
    setError(null);
    try {
      await deleteSlotSettings(slotSettingsId);
      setSlotSettingsList((prev) =>
        prev.filter((s) => s._id !== slotSettingsId)
      );
    } catch (err: unknown) {
      const appError = err as AppError;
      setError(appError.message || "Failed to delete slot settings");
      console.error("Delete slot settings error:", appError);
    }
  };

  const handleCreateBlockedSlot = async (
    e: React.FormEvent<HTMLFormElement>,
    timings: TimingSlot[]
  ) => {
    e.preventDefault();
    if (!venueId || !selectedSection) {
      setError("Venue ID or section is missing");
      return;
    }
    setIsSubmittingBlockedSlots(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name")?.toString() || "";
    const startDate = formData.get("startDate")?.toString() || undefined;
    const endDate = formData.get("endDate")?.toString() || undefined;
    const daysString = formData.get("days")?.toString() || "";
    const reason = formData.get("reason")?.toString() || "";

    // Process days
    const days = daysString
      ? daysString
          .split(",")
          .map((s) => s.trim().toUpperCase())
          .filter(Boolean)
      : [];

    // Filter out empty timing slots and check for any non-empty timings
    const validTimings = timings.filter((t) => t.startTime && t.endTime);
    const hasNonEmptyTimings = timings.some((t) => t.startTime || t.endTime);

    // Check if at least one field is provided
    if (
      !name &&
      !startDate &&
      !endDate &&
      days.length === 0 &&
      validTimings.length === 0 &&
      !reason
    ) {
      setError("At least one field must be provided to create a blocked slot");
      setIsSubmittingBlockedSlots(false);
      return;
    }

    // Validate dates if both are provided
    if (startDate && endDate) {
      if (new Date(startDate) > new Date(endDate)) {
        setError("Start date must be before or equal to end date");
        setIsSubmittingBlockedSlots(false);
        return;
      }
    } else if (startDate || endDate) {
      // If only one date is provided, require both
      setError("Both start date and end date must be provided if one is set");
      setIsSubmittingBlockedSlots(false);
      return;
    }

    // Validate timings for non-empty slots
    if (hasNonEmptyTimings) {
      const invalidTiming = validTimings.some((t) => {
        const [startHour, startMin] = t.startTime.split(":").map(Number);
        const [endHour, endMin] = t.endTime.split(":").map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        return startMinutes >= endMinutes;
      });
      if (invalidTiming) {
        setError(
          "All non-empty timing slots must have valid start and end times (start < end)"
        );
        setIsSubmittingBlockedSlots(false);
        return;
      }
    }

    const blockedSlotData: Omit<BlockedSlot, "_id"> = {
      name,
      venue: venueId,
      section: selectedSection._id,
      startDate,
      endDate,
      days,
      timings: validTimings,
      reason,
      isActive: true,
    };

    try {
      const newBlockedSlot = await saveBlockedSlots(blockedSlotData);
      setBlockedSettingsList((prev) => [...prev, newBlockedSlot]);
      setShowBlockedSlotSettingsModal(false);
    } catch (err: unknown) {
      const appError = err as AppError;
      setError(appError.message || "Failed to create blocked slot settings");
      console.error("Create blocked slot error:", appError);
    } finally {
      setIsSubmittingBlockedSlots(false);
    }
  };

  const handleUpdateBlockedSlot = async (
    e: React.FormEvent<HTMLFormElement>,
    timings: TimingSlot[]
  ) => {
    e.preventDefault();
    if (!selectedBlockedSlot || !selectedSection) {
      setError("Blocked slot or section is missing");
      return;
    }
    setIsSubmittingBlockedSlots(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name")?.toString();
    const startDate = formData.get("startDate")?.toString();
    const endDate = formData.get("endDate")?.toString();
    const days = formData.get("days")?.toString();
    const reason = formData.get("reason")?.toString();

    if (!name || !startDate || !endDate || !days || !reason) {
      setError(
        "Required fields are missing: name, startDate, endDate, days, or reason"
      );
      setIsSubmittingBlockedSlots(false);
      return;
    }

    const blockedSlotData: Partial<BlockedSlot> = {
      name,
      venue: venueId,
      section: selectedSection._id,
      startDate,
      endDate,
      days: days
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean),
      timings,
      reason,
      isActive: true,
    };

    try {
      const updatedBlockedSlot = await updateBlockedSettings(
        selectedBlockedSlot._id,
        blockedSlotData
      );
      setBlockedSettingsList((prev) =>
        prev.map((s) =>
          s._id === selectedBlockedSlot._id ? updatedBlockedSlot : s
        )
      );
      setShowBlockedSlotSettingsModal(false);
      setSelectedBlockedSlot(null);
    } catch (err: unknown) {
      const appError = err as AppError;
      setError(appError.message || "Failed to update blocked slot settings");
      console.error("Update blocked slot error:", appError);
    } finally {
      setIsSubmittingBlockedSlots(false);
    }
  };

  const handleDeleteBlockedSlot = async (blockedSettingsId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this blocked slot settings?"
      )
    )
      return;
    setError(null);
    try {
      await deleteBlockedSettings(blockedSettingsId);
      setBlockedSettingsList((prev) =>
        prev.filter((s) => s._id !== blockedSettingsId)
      );
    } catch (err: unknown) {
      const appError = err as AppError;
      setError(appError.message || "Failed to delete blocked slot settings");
      console.error("Delete blocked slot error:", appError);
    }
  };

  if (loading) {
    return (
      <>
        <VenueNavbar />
        <div className="min-h-screen bg-[#FFFFF8] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading venue and sections...</p>
          </div>
        </div>
      </>
    );
  }

  if (!venue) {
    return (
      <>
        <VenueNavbar />
        <div className="min-h-screen bg-[#FFFFF8] flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🏟️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Venue not found
            </h3>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              <FaArrowLeft />
              <span>Back to Venues</span>
            </button>
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
                  <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <FaArrowLeft className="text-white" />
                  </button>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
                      {venue.name}
                    </h1>
                    <p className="text-gray-300 text-lg mt-1">
                      Manage sections and slot settings
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {venue.sports.map((sport, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white text-xs font-medium rounded-full"
                    >
                      {sport}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="group flex items-center space-x-2 px-6 py-3 bg-white text-black rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 border-2 border-gray-800"
              >
                <FaPlus className="group-hover:rotate-90 transition-transform duration-200" />
                <span>New Section</span>
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-12 lg:px-20 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">Sections</h2>
              <p className="text-gray-600">
                Manage the different sections of your venue (e.g., courts,
                fields, pools)
              </p>
            </div>

            {sections.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🏀</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No sections found
                </h3>
                <p className="text-gray-500 mb-6">
                  Get started by adding your first section
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                >
                  <FaPlus />
                  <span>Add First Section</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sections.map((section) => (
                  <SectionCard
                    key={section._id}
                    section={section}
                    onManageSlots={handleOpenSlotSettingsListModal}
                    onBlockedSlots={handleOpenBlockedSettingsListModal}
                    onEdit={(section) => {
                      setSelectedSection(section);
                      setShowEditModal(true);
                    }}
                    onDelete={handleDeleteSection}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {showAddModal && (
          <SectionFormModal
            venue={venue}
            onSubmit={handleAddSection}
            onClose={() => setShowAddModal(false)}
            isSubmitting={isSubmittingSection}
            error={error}
          />
        )}
        {showEditModal && selectedSection && (
          <SectionFormModal
            venue={venue}
            section={selectedSection}
            onSubmit={handleEditSection}
            onClose={() => {
              setShowEditModal(false);
              setSelectedSection(null);
            }}
            isSubmitting={isSubmittingSection}
            error={error}
            isEditMode
          />
        )}
        {showSlotSettingsListModal && selectedSection && (
          <SlotSettingsListModal
            section={selectedSection}
            slotSettingsList={slotSettingsList}
            onCreate={() => {
              setSelectedSlotSettings(null);
              setShowSlotSettingsFormModal(true);
            }}
            onEdit={(slotSettings) => {
              setSelectedSlotSettings(slotSettings);
              setShowSlotSettingsFormModal(true);
            }}
            onDelete={handleDeleteSlotSettings}
            onClose={() => setShowSlotSettingsListModal(false)}
          />
        )}
        {showSlotSettingsFormModal && selectedSection && (
          <SlotSettingsFormModal
            venue={venue}
            section={selectedSection}
            slotSettings={selectedSlotSettings}
            onSubmit={
              selectedSlotSettings
                ? handleUpdateSlotSettings
                : handleCreateSlotSettings
            }
            onClose={() => {
              setShowSlotSettingsFormModal(false);
              setSelectedSlotSettings(null);
            }}
            isSubmitting={isSubmittingSlotSettings}
            error={error}
          />
        )}
        {showBlockedSettingsListModal && selectedSection && (
          <BlockedSettingsListModal
            section={selectedSection}
            blockedSettingsList={blockedSettingsList}
            onCreate={() => {
              setSelectedBlockedSlot(null);
              setShowBlockedSlotSettingsModal(true);
            }}
            onEdit={(blockedSlot) => {
              setSelectedBlockedSlot(blockedSlot);
              setShowBlockedSlotSettingsModal(true);
            }}
            onDelete={handleDeleteBlockedSlot}
            onClose={() => setShowBlockedSettingsListModal(false)}
          />
        )}
        {showBlockedSlotSettingsModal && selectedSection && (
          <BlockedSlotSettingsModal
            section={selectedSection}
            blockedSlot={selectedBlockedSlot}
            onSubmit={
              selectedBlockedSlot
                ? handleUpdateBlockedSlot
                : handleCreateBlockedSlot
            }
            onClose={() => {
              setShowBlockedSlotSettingsModal(false);
              setSelectedBlockedSlot(null);
            }}
            isSubmitting={isSubmittingBlockedSlots}
            error={error}
          />
        )}
      </div>
      <VOFooter />
    </>
  );
};

export default ManageSections;
