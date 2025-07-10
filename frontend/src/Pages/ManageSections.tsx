import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VOFooter from "../Components/Footer/VOFooter";
import VenueNavbar from "../Components/Navbar/VenueNavbar";
import {
  FaPlus,
  FaClock,
  FaArrowLeft,
  FaSave,
} from "react-icons/fa";
import {
  createSection,
  getVenueSections,
  createOrUpdateSlotSettings,
  getSlotSettings,
} from "../../services/sectionService";
import { getVenueById } from "../../services/venueService";

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
}: {
  section: Section;
  onManageSlots: (sectionId: string) => void;
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
  onSubmit,
  onClose,
  isSubmitting,
  error,
}: {
  venue: Venue;
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
              <FaPlus className="text-black text-sm" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-black">Add New Section</h2>
              <p className="text-gray-600 text-sm">
                Create a new section for {venue.name}
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
              <select
                name="sport"
                required
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
              min="15"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
              placeholder="Enter minimum duration"
              defaultValue="60"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              name="description"
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
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  isSubmitting: boolean;
  error: string | null;
}) => {
  const [duration, setDuration] = useState(slotSettings?.duration || 60);

  const generateAvailableTimings = useCallback(() => {
    const timings: TimingSlot[] = [];
    const [openHour, openMin] = venue.openingTime.split(":").map(Number);
    const [closeHour, closeMin] = venue.closingTime.split(":").map(Number);
    
    let currentTime = new Date();
    currentTime.setHours(openHour, openMin, 0, 0);
    const endTime = new Date();
    endTime.setHours(closeHour, closeMin, 0, 0);

    while (currentTime < endTime) {
      const slotEndTime = new Date(currentTime);
      slotEndTime.setMinutes(currentTime.getMinutes() + duration);

      if (slotEndTime > endTime) break;

      timings.push({
        startTime: currentTime.toTimeString().slice(0, 5),
        endTime: slotEndTime.toTimeString().slice(0, 5),
      });

      currentTime.setMinutes(currentTime.getMinutes() + duration);
    }

    return timings;
  }, [venue, duration]);

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
                  Manage Slot Settings
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
          <form onSubmit={onSubmit} className="px-8 py-8 space-y-10">
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
                    defaultValue={slotSettings?.startDate || ""}
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
                <p className="text-xs text-gray-500">
                  Separate days with commas (e.g., Monday,Tuesday)
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
                  min={section.minimumDuration || 1}
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
                <label className="block text-sm font-semibold text-gray-700">
                  Available Timings (Generated)
                </label>
                <input
                  type="text"
                  name="timings"
                  readOnly
                  value={
                    generateAvailableTimings()
                      .map((t) => `${t.startTime}-${t.endTime}`)
                      .join(";") || ""
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500">
                  Timings are auto-generated based on venue hours and slot duration.
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

const ManageSections = () => {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSlotSettingsModal, setShowSlotSettingsModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [slotSettings, setSlotSettings] = useState<SlotSettings | null>(null);
  const [isSubmittingSection, setIsSubmittingSection] = useState(false);
  const [isSubmittingSlotSettings, setIsSubmittingSlotSettings] = useState(false);

  const fetchVenueAndSections = useCallback(async () => {
    setLoading(true);
    try {
      const [venueData, sectionsData] = await Promise.all([
        getVenueById(venueId!),
        getVenueSections(venueId!),
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
    if (venueId) {
      fetchVenueAndSections();
    }
  }, [venueId, fetchVenueAndSections]);

  const handleAddSection = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingSection(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const sectionData = {
      name: formData.get("sectionName") as string,
      venue: venueId!,
      sport: formData.get("sport") as string,
      priceModel: formData.get("priceModel") as string,
      basePrice: parseFloat(formData.get("basePrice") as string),
      capacity: parseInt(formData.get("capacity") as string),
      description: formData.get("description") as string,
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
      await createSection(sectionData);
      await fetchVenueAndSections();
      setShowAddModal(false);
    } catch (err) {
      setError(`Failed to create section: ${(err as Error).message}`);
      console.error(err);
    } finally {
      setIsSubmittingSection(false);
    }
  };

  const handleOpenSlotSettingsModal = async (section: Section) => {
    setSelectedSection(section);
    try {
      const data = await getSlotSettings(section._id);
      setSlotSettings(data);
    } catch (err) {
      setSlotSettings(null);
      setError("Failed to fetch slot settings");
      console.error(err);
    }
    setShowSlotSettingsModal(true);
  };

  const handleAddOrUpdateSlotSettings = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setIsSubmittingSlotSettings(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const generatedTimings = generateAvailableTimings(
      venue!,
      parseInt(formData.get("duration") as string) || 60
    );

    const slotSettingsData = {
      venueId: venueId!,
      sectionId: selectedSection!._id,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      days: (formData.get("days") as string)
        ?.split(",")
        .map((d) => d.trim())
        .filter(Boolean) || [],
      duration: parseInt(formData.get("duration") as string) || 60,
      bookingAllowed: parseInt(formData.get("bookingAllowed") as string) || 1,
      priceModel: selectedSection?.priceModel || "perHour",
      basePrice: selectedSection?.basePrice || 0,
      isActive: true,
      venue: venueId!,
      section: selectedSection!._id,
      timings: generatedTimings,
    };

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

  const generateAvailableTimings = (venue: Venue, duration: number) => {
    const timings: TimingSlot[] = [];
    const [openHour, openMin] = venue.openingTime.split(":").map(Number);
    const [closeHour, closeMin] = venue.closingTime.split(":").map(Number);
    
    let currentTime = new Date();
    currentTime.setHours(openHour, openMin, 0, 0);
    const endTime = new Date();
    endTime.setHours(closeHour, closeMin, 0, 0);

    while (currentTime < endTime) {
      const slotEndTime = new Date(currentTime);
      slotEndTime.setMinutes(currentTime.getMinutes() + duration);

      if (slotEndTime > endTime) break;

      timings.push({
        startTime: currentTime.toTimeString().slice(0, 5),
        endTime: slotEndTime.toTimeString().slice(0, 5),
      });

      currentTime.setMinutes(currentTime.getMinutes() + duration);
    }

    return timings;
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
                    onManageSlots={() => handleOpenSlotSettingsModal(section)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {showAddModal && venue && (
          <SectionFormModal
            venue={venue}
            onSubmit={handleAddSection}
            onClose={() => setShowAddModal(false)}
            isSubmitting={isSubmittingSection}
            error={error}
          />
        )}

        {showSlotSettingsModal && venue && selectedSection && (
          <SlotSettingsFormModal
            venue={venue}
            section={selectedSection}
            slotSettings={slotSettings}
            onSubmit={handleAddOrUpdateSlotSettings}
            onClose={() => setShowSlotSettingsModal(false)}
            isSubmitting={isSubmittingSlotSettings}
            error={error}
          />
        )}

        <VOFooter />
      </div>
    </>
  );
};

export default ManageSections;