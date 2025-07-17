import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getVenueById } from "../../services/venueService";
import { getVenueSections } from "../../services/sectionService";
import Footer from "../Components/Footer/VOFooter";
import CustomerNavbar from "../Components/Navbar/CustomerNavbar";
import { FaMapMarkerAlt, FaClock, FaPhone, FaStar } from "react-icons/fa";
import axios from "axios";

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
  images: string[];
}

interface Section {
  _id: string;
  name: string;
  venue: string;
  sport: string;
  capacity: number;
  description?: string;
  images?: string[];
  rules?: string[];
  isActive: boolean;
}

interface Slot {
  slotId: string;
  sectionId: string;
  sectionName: string;
  venueName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  price: number;
  settingName: string;
  isAvailable: boolean;
}

const getAvailableSlots = async (
  sectionId: string,
  date: string
): Promise<{ availableSlots: Slot[]; blockedReason?: string }> => {
  try {
    console.log(`Fetching slots for section ${sectionId} on ${date}`);
    const response = await axios.get(
      `http://localhost:5000/api/bookings/${sectionId}/available-slots`,
      {
        params: { date },
      }
    );
    const data = response.data;
    console.log("Slots API response:", data, "Status:", response.status);

    if (!data || !data.success || !Array.isArray(data.data.slots)) {
      console.error("Invalid slots response format:", data);
      return { availableSlots: [], blockedReason: data.data?.blockedReason };
    }

    const availableSlots: Slot[] = data.data.slots.map((slot: any) => ({
      slotId: slot.slotId,
      sectionId: slot.sectionId,
      sectionName: slot.sectionName,
      venueName: slot.venueName,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      duration: slot.duration,
      price: slot.price,
      settingName: slot.settingName,
      isAvailable: slot.isAvailable,
    }));

    console.log(`Mapped ${availableSlots.length} slots:`, availableSlots);
    return { availableSlots, blockedReason: data.data.blockedReason };
  } catch (error) {
    console.error("Error fetching slots:", error);
    let errorMessage = "Failed to fetch available slots from the server";
    let blockedReason: string | undefined;
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = error.response.data?.error || error.message;
      blockedReason = error.response.data?.data?.blockedReason;
    }
    // Instead of using cause, throw a custom error object with blockedReason
    const customError = new Error(errorMessage) as Error & { blockedReason?: string };
    customError.blockedReason = blockedReason;
    throw customError;
  }
};

const createBooking = async (bookingData: {
  userId: string;
  sectionId: string;
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
}): Promise<void> => {
  try {
    console.log("Creating booking:", bookingData);
    await axios.post("http://localhost:5000/api/bookings", bookingData);
    alert("Booking Successful");
  } catch (error) {
    console.error("Error creating booking:", error);
    let errorMessage = "Failed to create booking on the server";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = `Failed to create booking: ${
        error.response.data?.error || error.message
      } (Status: ${error.response.status})`;
    }
    throw new Error(errorMessage);
  }
};

const ErrorBoundary = ({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error("Uncaught error:", error);
      setHasError(true);
    };
    window.addEventListener("error", errorHandler);
    return () => window.removeEventListener("error", errorHandler);
  }, []);

  if (hasError) return fallback;
  return <>{children}</>;
};

const CustomerVenue = () => {
  const { id } = useParams<{ id: string }>();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [blockedReason, setBlockedReason] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null); // TODO: Replace with auth context

  useEffect(() => {
    // Simulate fetching userId from auth context (replace with actual auth logic)
    setUserId("6863d1cfa8d1e82535f71e3f"); // Placeholder; integrate with auth system in production
  }, []);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        if (!id) throw new Error("Venue ID is missing");
        const venueData = await getVenueById(id);
        const completeVenueData = {
          ...venueData,
          images: venueData.images || [],
        };
        setVenue(completeVenueData);
        const sectionsData = await getVenueSections(id);
        setSections(Array.isArray(sectionsData) ? sectionsData : []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching venue or sections:", err);
        setError("Failed to fetch venue or sections");
        setLoading(false);
      }
    };

    fetchVenue();
  }, [id]);

  const fetchSlots = async (sectionId: string, date: string) => {
    setSlotsLoading(true);
    setError(null);
    setBlockedReason(undefined);
    try {
      const { availableSlots, blockedReason } = await getAvailableSlots(sectionId, date);
      console.log(`Received ${availableSlots.length} slots for ${date}`);
      setSlots(availableSlots);
      setBlockedReason(blockedReason);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch available slots";
      const blockedReason = err.blockedReason;
      setError(errorMessage);
      if (blockedReason) setBlockedReason(blockedReason);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleSectionSelect = (section: Section) => {
    setSelectedSection(section);
    setSelectedDate("");
    setSlots([]);
    setError(null);
    setBlockedReason(undefined);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    const today = new Date().toISOString().split("T")[0];

    if (date < today) {
      setError("Cannot select a past date");
      setSelectedDate("");
      setSlots([]);
      setBlockedReason(undefined);
      return;
    }

    setSelectedDate(date);
    setError(null);
    setBlockedReason(undefined);
    if (selectedSection && date) {
      console.log(`Calling fetchSlots for section ${selectedSection._id} and date ${date}`);
      fetchSlots(selectedSection._id, date);
    }
  };

  const handleBookSlot = async (slot: Slot) => {
    if (!selectedSection || !id) {
      setError("Please select a section and venue");
      return;
    }

    if (!userId) {
      setError("You must be logged in to book a slot");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const bookingData = {
      userId,
      sectionId: selectedSection._id,
      slotId: slot.slotId,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      notes: "", // Optional field as per backend
    };

    try {
      await createBooking(bookingData);
      if (selectedDate && selectedSection) {
        fetchSlots(selectedSection._id, selectedDate); // Refresh slots after booking
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAddress = (address: Address) => {
    return `${address.street}, ${address.city}, ${address.state}, ${address.country} ${address.zipCode}`;
  };

  const formatPrice = (price: number) => {
    return `₹${price.toFixed(2)}`;
  };

  const fallbackUI = (
    <div className="min-h-screen bg-[#FFFFF8] flex items-center justify-center">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Something went wrong
        </h3>
        <p className="text-gray-500 mb-6">
          An error occurred while rendering the page. Please try again or contact support.
        </p>
        <Link
          to="/customer-grid"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
        >
          <span>Back to Venues</span>
        </Link>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallbackUI}>
      <CustomerNavbar />
      <div className="min-h-screen bg-[#FFFFF8]">
        {loading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">Loading venue...</p>
            </div>
          </div>
        ) : !venue ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Venue not found
              </h3>
              <Link
                to="/customer-grid"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
              >
                <span>Back to Venues</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-black to-gray-900 px-6 sm:px-12 lg:px-20 pt-12 pb-16">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
                        <FaStar className="text-black text-xl" />
                      </div>
                      <div>
                        <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
                          {venue.name}
                        </h1>
                        <p className="text-gray-300 text-lg mt-1">
                          {formatAddress(venue.address)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 sm:px-12 lg:px-20 -mt-8 mb-12">
              <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h2 className="text-2xl font-bold text-black mb-4">
                        Venue Details
                      </h2>
                      <p className="text-gray-600 mb-4">{venue.description}</p>
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
                        <div className="flex items-center space-x-3 text-gray-600">
                          <FaStar className="text-gray-500 text-sm" />
                          <span className="text-sm">
                            Sports: {venue.sports.join(", ")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      {venue.images && venue.images.length > 0 ? (
                        <img
                          src={venue.images[0]}
                          alt={venue.name}
                          className="w-full h-64 object-cover rounded-xl"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder-image.jpg";
                            console.error("Failed to load venue image");
                          }}
                        />
                      ) : (
                        <div className="w-full h-64 bg-gray-200 rounded-xl flex items-center justify-center">
                          <span className="text-gray-500">
                            No image available
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h2 className="text-2xl font-bold text-black mb-4">
                    Available Sections
                  </h2>
                  {sections.length === 0 ? (
                    <p className="text-gray-500">
                      No sections available for this venue.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sections.map((section) => (
                        <div
                          key={section._id}
                          className={`bg-white rounded-2xl shadow-sm border ${
                            selectedSection?._id === section._id
                              ? "border-black"
                              : "border-gray-200"
                          } p-6 cursor-pointer hover:shadow-md transition-shadow duration-200`}
                          onClick={() => handleSectionSelect(section)}
                        >
                          <h3 className="text-lg font-semibold text-black">
                            {section.name}
                          </h3>
                          <p className="text-gray-600 text-sm mt-2">
                            {section.description || "No description available"}
                          </p>
                          <div className="mt-4 space-y-2">
                            <p className="text-sm text-gray-600">
                              Sport: {section.sport}
                            </p>
                            <p className="text-sm text-gray-600">
                              Capacity: {section.capacity}
                            </p>
                            {section.rules && section.rules.length > 0 && (
                              <p className="text-sm text-gray-600">
                                Rules: {section.rules.join(", ")}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedSection && (
                  <div className="mt-8">
                    <h2 className="text-2xl font-bold text-black mb-4">
                      Book a Slot for {selectedSection.name}
                    </h2>
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Select Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={handleDateChange}
                        className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                      />
                    </div>

                    {selectedDate && (
                      <div>
                        <h3 className="text-lg font-semibold text-black mb-4">
                          Available Slots
                        </h3>
                        {slotsLoading ? (
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading slots...</p>
                          </div>
                        ) : slots.length === 0 ? (
                          <p className="text-gray-500">
                            {blockedReason
                              ? `No slots available: ${blockedReason}`
                              : "No slots available for this date. Please try another date or section."}
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {slots.map((slot) => (
                              <button
                                key={slot.slotId}
                                onClick={() => handleBookSlot(slot)}
                                disabled={!slot.isAvailable || isSubmitting || !userId}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                                  slot.isAvailable && !isSubmitting && userId
                                    ? "bg-black text-white hover:bg-gray-800"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                              >
                                {slot.startTime} - {slot.endTime} ({formatPrice(slot.price)})
                                {slot.isAvailable ? "" : " (Booked)"}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {error && (
                  <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-start">
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
              </div>
            </div>
            <Footer />
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default CustomerVenue;