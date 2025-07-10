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
} from "../../services/sectionService";
import { getVenueById } from "../../services/venueService";

interface Section {
  _id: string;
  name: string;
  venue: string;
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
  startDate?: string;
  endDate?: string;
  days: string[];
  timings: TimingSlot[];
  duration: number;
  bookingAllowed: number;
  priceModel: string;
  basePrice: number;
  isActive: boolean;
}

interface Venue {
  _id: string;
  name: string;
  openingTime: string;
  closingTime: string;
  sports: string[];
}

const SectionCard = ({
  section,
  onManageSlots,
  onEdit,
  onDelete,
}: {
  section: Section;
  onManageSlots: (sectionId: string) => void;
  onEdit: (section: Section) => void;
  onDelete: (sectionId: string) => void;
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-black mb-2">{section.name}</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                {section.sport}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                {section.priceModel}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                Capacity: {section.capacity}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(section)}
              className="p-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => onDelete(section._id)}
              className="p-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
            >
              <FaTrash />
            </button>
            <button
              onClick={() => onManageSlots(section._id)}
              className="px-4 py-2 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              Manage Slots
            </button>
          </div>
        </div>

        {section.description && (
          <p className="text-gray-600 text-sm mb-4">{section.description}</p>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
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
          <div className="text-sm font-medium text-gray-700">
            ₹{section.basePrice} / {section.priceModel === "perHour" ? "hour" : "slot"}
          </div>
        </div>
      </div>
    </div>
  );
};

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
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
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
              <h2 className="text-2xl font-bold text-black">{isEditMode ? "Edit Section" : "Add New Section"}</h2>
              <p className="text-gray-600 text-sm">
                {isEditMode ? `Update details for ${section?.name}` : `Create a new section for ${venue.name}`}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Price Model <span className="text-red-500">*</span>
              </label>
              <select
                name="priceModel"
                required
                defaultValue={section?.priceModel || "perHour"}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
              >
                <option value="perHour">Per Hour</option>
                <option value="perSlot">Per Slot</option>
                <option value="perSession">Per Session</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Base Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="basePrice"
                required
                min="0"
                step="0.01"
                defaultValue={section?.basePrice || ""}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                placeholder="Enter base price (e.g., 100.50)"
              />
              <p className="text-xs text-gray-500">
                Enter a positive number for the base price (e.g., 100.50)
              </p>
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
              Minimum Duration (minutes) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="minimumDuration"
              required
              min="15"
              defaultValue={section?.minimumDuration || 60}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
              placeholder="Enter minimum duration"
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
  onSubmit: (e: React.FormEvent<HTMLFormElement>, timings: TimingSlot[]) => void;
  onClose: () => void;
  isSubmitting: boolean;
  error: string | null;
}) => {
  const [timings, setTimings] = useState<TimingSlot[]>(
    slotSettings?.timings || [{ startTime: "", endTime: "" }]
  );
  const [duration, setDuration] = useState(slotSettings?.duration || section.minimumDuration || 60);
  const [generatedSlots, setGeneratedSlots] = useState<string[]>([]);

  const addTimingSlot = () => {
    setTimings([...timings, { startTime: "", endTime: "" }]);
  };

  const removeTimingSlot = (index: number) => {
    if (timings.length > 1) {
      setTimings(timings.filter((_, i) => i !== index));
    }
  };

  const updateTimingSlot = (index: number, field: keyof TimingSlot, value: string) => {
    const newTimings = [...timings];
    newTimings[index][field] = value;
    setTimings(newTimings);
    generateSlots(newTimings, duration);
  };

  const generateSlots = useCallback((timings: TimingSlot[], duration: number) => {
    const slots: string[] = [];
    timings.forEach(({ startTime, endTime }) => {
      if (!startTime || !endTime) return;
      const [startHour, startMin] = startTime.split(":").map(Number);
      const [endHour, endMin] = endTime.split(":").map(Number);

      const start = new Date();
      start.setHours(startHour, startMin, 0, 0);

      const end = new Date();
      end.setHours(endHour, endMin, 0, 0);

      let current = new Date(start);
      while (current < end) {
        const slotEnd = new Date(current.getTime() + duration * 60000);
        if (slotEnd > end) break;
        slots.push(
          `${current.toTimeString().slice(0, 5)}-${slotEnd.toTimeString().slice(0, 5)}`
        );
        current = slotEnd;
      }
    });
    setGeneratedSlots(slots);
  }, []);

  useEffect(() => {
    generateSlots(timings, duration);
  }, [duration, timings, generateSlots]);

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
          <form
            onSubmit={(e) => onSubmit(e, timings)}
            className="px-8 py-8 space-y-10"
          >
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    defaultValue={slotSettings?.startDate?.split('T')[0] || ""}
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
                    defaultValue={slotSettings?.endDate?.split('T')[0] || ""}
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
                  pattern="(MON|TUE|WED|THU|FRI|SAT|SUN)(,(MON|TUE|WED|THU|FRI|SAT|SUN))*"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  placeholder="MON,TUE,WED"
                  defaultValue={slotSettings?.days.join(",") || ""}
                />
                <p className="text-xs text-gray-500">
                  Separate days with commas (e.g., MON,TUE,WED). Use uppercase: MON, TUE, WED, THU, FRI, SAT, SUN
                </p>
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
                      onChange={(e) => updateTimingSlot(index, "startTime", e.target.value)}
                      className="w-1/2 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    />
                    <input
                      type="time"
                      required
                      value={timing.endTime}
                      onChange={(e) => updateTimingSlot(index, "endTime", e.target.value)}
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
                  Add multiple time ranges for availability (e.g., 09:00-11:00, 17:00-18:00)
                </p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Slot Duration (minutes) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="duration"
                  required
                  min={section.minimumDuration || 5}
                  max="480"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  placeholder="60"
                  defaultValue={slotSettings?.duration || section.minimumDuration || 60}
                  onChange={(e) => setDuration(parseInt(e.target.value) || section.minimumDuration || 60)}
                />
                <p className="text-xs text-gray-500">
                  Duration must be between {section.minimumDuration || 5} and 480 minutes
                </p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Generated Slots (Preview)
                </label>
                <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100">
                  {generatedSlots.length > 0 ? (
                    generatedSlots.map((slot, index) => (
                      <div key={index} className="text-sm text-gray-700">{slot}</div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No slots generated yet</div>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Slots are generated based on timing slots and duration
                </p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Max Bookings Allowed (days in advance) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="bookingAllowed"
                  required
                  min="1"
                  max="365"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  placeholder="7"
                  defaultValue={slotSettings?.bookingAllowed || 7}
                />
                <p className="text-xs text-gray-500">
                  Number of days in advance bookings are allowed (1-365)
                </p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Price Model
                </label>
                <input
                  type="text"
                  name="priceModel"
                  readOnly
                  value={section.priceModel}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500">
                  Inherited from section settings
                </p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Base Price
                </label>
                <input
                  type="number"
                  name="basePrice"
                  readOnly
                  value={section.basePrice}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500">
                  Inherited from section settings
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
                      {slotSettings ? "Update Slot Settings" : "Create Slot Settings"}
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
              <p className="text-gray-600">No slot settings found. Create one to get started.</p>
            ) : (
              <div className="space-y-4">
                {slotSettingsList.map((settings) => (
                  <div
                    key={settings._id}
                    className="bg-white rounded-xl border border-gray-200 p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold text-black">
                        Days: {settings.days.join(", ")}
                      </p>
                      <p className="text-sm text-gray-600">
                        Duration: {settings.duration} minutes
                      </p>
                      <p className="text-sm text-gray-600">
                        Bookings Allowed: {settings.bookingAllowed} days
                      </p>
                      <p className="text-sm text-gray-600">
                        Timings: {settings.timings.map(t => `${t.startTime}-${t.endTime}`).join(", ")}
                      </p>
                      {settings.startDate && (
                        <p className="text-sm text-gray-600">
                          Start Date: {new Date(settings.startDate).toLocaleDateString()}
                        </p>
                      )}
                      {settings.endDate && (
                        <p className="text-sm text-gray-600">
                          End Date: {new Date(settings.endDate).toLocaleDateString()}
                        </p>
                      )}
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

const ManageSections = () => {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSlotSettingsListModal, setShowSlotSettingsListModal] = useState(false);
  const [showSlotSettingsFormModal, setShowSlotSettingsFormModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedSlotSettings, setSelectedSlotSettings] = useState<SlotSettings | null>(null);
  const [slotSettingsList, setSlotSettingsList] = useState<SlotSettings[]>([]);
  const [isSubmittingSection, setIsSubmittingSection] = useState(false);
  const [isSubmittingSlotSettings, setIsSubmittingSlotSettings] = useState(false);

  const fetchVenueAndSections = useCallback(async () => {
    if (!venueId) {
      setError("Venue ID is missing");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [venueData, sectionsData] = await Promise.all([
        getVenueById(venueId),
        getVenueSections(venueId),
      ]);
      setVenue(venueData);
      setSections(sectionsData);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch venue and sections");
      setLoading(false);
      console.error(err);
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
    const basePrice = parseFloat(formData.get("basePrice") as string);
    if (isNaN(basePrice) || basePrice < 0) {
      setError("Base price must be a positive number");
      setIsSubmittingSection(false);
      return;
    }

    const sectionData: Omit<Section, '_id'> = {
      name: formData.get("name") as string,
      venue: venueId,
      sport: formData.get("sport") as string,
      priceModel: formData.get("priceModel") as string,
      basePrice,
      capacity: parseInt(formData.get("capacity") as string),
      description: (formData.get("description") as string)?.trim() || undefined,
      minimumDuration: parseInt(formData.get("minimumDuration") as string),
      images: (formData.get("images") as string)
        ?.split(",")
        .map((s) => s.trim())
        .filter(Boolean) || [],
      rules: (formData.get("rules") as string)
        ?.split(",")
        .map((s) => s.trim())
        .filter(Boolean) || [],
      isActive: true,
      ownerBlockedTime: [],
      maintenanceTime: [],
    };

    try {
      const newSection = await createSection(sectionData);
      if (!newSection || !newSection._id) {
        await fetchVenueAndSections(); // Fallback to refresh sections if API doesn't return new section
      } else {
        setSections((prevSections) => [...prevSections, newSection]);
      }
      setShowAddModal(false);
    } catch (err) {
      setError(`Failed to create section: ${(err as Error).message}`);
      console.error(err);
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
    const basePrice = parseFloat(formData.get("basePrice") as string);
    if (isNaN(basePrice) || basePrice < 0) {
      setError("Base price must be a positive number");
      setIsSubmittingSection(false);
      return;
    }

    const sectionData: Omit<Section, '_id'> = {
      name: formData.get("name") as string,
      venue: venueId,
      sport: formData.get("sport") as string,
      priceModel: formData.get("priceModel") as string,
      basePrice,
      capacity: parseInt(formData.get("capacity") as string),
      description: (formData.get("description") as string)?.trim() || undefined,
      minimumDuration: parseInt(formData.get("minimumDuration") as string),
      images: (formData.get("images") as string)
        ?.split(",")
        .map((s) => s.trim())
        .filter(Boolean) || [],
      rules: (formData.get("rules") as string)
        ?.split(",")
        .map((s) => s.trim())
        .filter(Boolean) || [],
      isActive: true,
      ownerBlockedTime: selectedSection.ownerBlockedTime,
      maintenanceTime: selectedSection.maintenanceTime,
    };

    try {
      await updateSection(selectedSection._id, sectionData);
      setSections((prevSections) =>
        prevSections.map((s) =>
          s._id === selectedSection._id ? { ...s, ...sectionData } : s
        )
      );
      setShowEditModal(false);
      setSelectedSection(null);
    } catch (err) {
      setError(`Failed to update section: ${(err as Error).message}`);
      console.error(err);
    } finally {
      setIsSubmittingSection(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!window.confirm("Are you sure you want to delete this section?")) return;
    try {
      await deleteSection(sectionId);
      setSections((prevSections) => prevSections.filter((s) => s._id !== sectionId));
    } catch (err) {
      setError(`Failed to delete section: ${(err as Error).message}`);
      console.error(err);
    }
  };

  const handleOpenSlotSettingsListModal = async (sectionId: string) => {
    try {
      const section = sections.find((s) => s._id === sectionId) || await getSectionById(sectionId);
      if (!section) {
        throw new Error("Section not found");
      }
      setSelectedSection(section);
      const data = await getSlotSettings(sectionId);
      setSlotSettingsList(data);
      setShowSlotSettingsListModal(true);
    } catch (err) {
      setError("Failed to fetch section or slot settings");
      console.error(err);
    }
  };

  const handleCreateSlotSettings = () => {
    setSelectedSlotSettings(null);
    setShowSlotSettingsListModal(false);
    setShowSlotSettingsFormModal(true);
  };

  const handleEditSlotSettings = (slotSettings: SlotSettings) => {
    setSelectedSlotSettings(slotSettings);
    setShowSlotSettingsListModal(false);
    setShowSlotSettingsFormModal(true);
  };

  const handleDeleteSlotSettings = async (slotSettingsId: string) => {
    if (!window.confirm("Are you sure you want to delete this slot setting?")) return;
    try {
      await deleteSlotSettings(slotSettingsId);
      const updatedList = await getSlotSettings(selectedSection!._id);
      setSlotSettingsList(updatedList);
    } catch (err) {
      setError(`Failed to delete slot settings: ${(err as Error).message}`);
      console.error(err);
    }
  };

  const handleAddOrUpdateSlotSettings = async (
    e: React.FormEvent<HTMLFormElement>,
    timings: TimingSlot[]
  ) => {
    e.preventDefault();
    setIsSubmittingSlotSettings(true);
    setError(null);

    if (!venueId || !selectedSection || !venue) {
      setError("Venue, section, or venue data is missing");
      setIsSubmittingSlotSettings(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const daysInput = formData.get("days") as string;
    const durationInput = formData.get("duration") as string;
    const bookingAllowedInput = formData.get("bookingAllowed") as string;

    // Validate days
    const validDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    const days = daysInput
      ?.split(",")
      .map((d) => d.trim().toUpperCase())
      .filter((d) => validDays.includes(d)) || [];

    if (days.length === 0) {
      setError("Please provide at least one valid day (e.g., MON, TUE)");
      setIsSubmittingSlotSettings(false);
      return;
    }

    // Validate duration
    const duration = parseInt(durationInput) || selectedSection.minimumDuration || 60;
    if (duration < (selectedSection.minimumDuration || 5) || duration > 480) {
      setError(`Duration must be between ${selectedSection.minimumDuration || 5} and 480 minutes`);
      setIsSubmittingSlotSettings(false);
      return;
    }

    // Validate bookingAllowed
    const bookingAllowed = parseInt(bookingAllowedInput) || 7;
    if (bookingAllowed < 1 || bookingAllowed > 365) {
      setError("Booking allowed must be between 1 and 365 days");
      setIsSubmittingSlotSettings(false);
      return;
    }

    // Validate timings
    const validTimings = timings.filter(
      (t) => t.startTime && t.endTime && t.startTime < t.endTime
    );
    if (validTimings.length === 0) {
      setError("At least one valid timing slot (start time before end time) is required");
      setIsSubmittingSlotSettings(false);
      return;
    }

    const slotSettingsData: Omit<SlotSettings, '_id'> = {
      venue: venueId,
      section: selectedSection._id,
      startDate: (formData.get("startDate") as string)?.trim() || undefined,
      endDate: (formData.get("endDate") as string)?.trim() || undefined,
      days,
      timings: validTimings,
      duration,
      bookingAllowed,
      priceModel: selectedSection.priceModel,
      basePrice: selectedSection.basePrice,
      isActive: true,
    };

    try {
      if (selectedSlotSettings) {
        // Update existing slot settings
        await updateSlotSettings(selectedSlotSettings._id, slotSettingsData);
      } else {
        // Create new slot settings
        await createSlotSettings(slotSettingsData);
      }
      // Refresh slot settings list
      const updatedList = await getSlotSettings(selectedSection._id);
      setSlotSettingsList(updatedList);
      setShowSlotSettingsFormModal(false);
      setShowSlotSettingsListModal(true);
      setSelectedSlotSettings(null);
    } catch (err) {
      setError(`Failed to manage slot settings: ${(err as Error).message}`);
      console.error(err);
    } finally {
      setIsSubmittingSlotSettings(false);
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
                Manage the different sections of your venue (e.g., courts, fields, pools)
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
                    onManageSlots={() => handleOpenSlotSettingsListModal(section._id)}
                    onEdit={() => {
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
            onCreate={handleCreateSlotSettings}
            onEdit={handleEditSlotSettings}
            onDelete={handleDeleteSlotSettings}
            onClose={() => {
              setShowSlotSettingsListModal(false);
              setSelectedSection(null);
              setSlotSettingsList([]);
            }}
          />
        )}
        {showSlotSettingsFormModal && selectedSection && (
          <SlotSettingsFormModal
            venue={venue}
            section={selectedSection}
            slotSettings={selectedSlotSettings}
            onSubmit={handleAddOrUpdateSlotSettings}
            onClose={() => {
              setShowSlotSettingsFormModal(false);
              setShowSlotSettingsListModal(true);
              setSelectedSlotSettings(null);
            }}
            isSubmitting={isSubmittingSlotSettings}
            error={error}
          />
        )}
      </div>
      <VOFooter />
    </>
  );
};

export default ManageSections;