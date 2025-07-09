import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getVenueById } from "../../services/venueService";
import { getVenueSections, getAvailableSlots, createBooking } from "../../services/sectionService";
import Footer from "../Components/Footer/VOFooter";
import CustomerNavbar from "../Components/Navbar/CustomerNavbar";
import { FaMapMarkerAlt, FaClock, FaPhone, FaStar, FaCalendarAlt } from "react-icons/fa";

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
  sport: string;
  priceModel: string;
  basePrice: number;
  capacity: number;
  description?: string;
  images?: string[];
  rules?: string[];
}

interface Slot {
  _id: string;
  startTime: string;
  endTime: string;
  date: string;
  available: boolean;
}

const CustomerVenue = () => {
  const { id } = useParams<{ id: string }>();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        if (id) {
          const venueData = await getVenueById(id);
          setVenue(venueData);
          const sectionsData = await getVenueSections(id);
          setSections(sectionsData);
          setLoading(false);
        }
      } catch (err) {
        setError("Failed to fetch venue or sections");
        setLoading(false);
        console.error(err);
      }
    };

    fetchVenue();
  }, [id]);

  const fetchSlots = async (sectionId: string, date: string) => {
    try {
      const slotData = await getAvailableSlots(sectionId, date);
      setSlots(slotData.availableSlots);
    } catch (err) {
      setError("Failed to fetch available slots");
      console.error(err);
    }
  };

  const handleSectionSelect = (section: Section) => {
    setSelectedSection(section);
    setSelectedDate("");
    setSlots([]);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    if (selectedSection && date) {
      fetchSlots(selectedSection._id, date);
    }
  };

  const handleBookSlot = async (slot: Slot) => {
    if (!selectedSection || !id) return;

    setIsSubmitting(true);
    setError(null);

    const bookingData = {
      userId: "6863d1cfa8d1e82535f71e3f", // Replace with actual user ID from auth context
      venueId: id,
      sectionId: selectedSection._id,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      slotId: slot._id,
    };

    try {
      await createBooking(bookingData);
      alert("Booking successful!");
      // Refresh slots after booking
      if (selectedDate) {
        fetchSlots(selectedSection._id, selectedDate);
      }
    } catch (err) {
      setError("Failed to create booking");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAddress = (address: Address) => {
    return `${address.street}, ${address.city}, ${address.state}, ${address.country} ${address.zipCode}`;
  };

  if (loading) {
    return (
      <>
        <CustomerNavbar />
        <div className="min-h-screen bg-[#FFFFF8] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading venue...</p>
          </div>
        </div>
      </>
    );
  }

  if (!venue) {
    return (
      <>
        <CustomerNavbar />
        <div className="min-h-screen bg-[#FFFFF8] flex items-center justify-center">
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
      </>
    );
  }

  return (
    <>
      <CustomerNavbar />
      <div className="min-h-screen bg-[#FFFFF8]">
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
                  <h2 className="text-2xl font-bold text-black mb-4">Venue Details</h2>
                  <p className="text-gray-600 mb-4">{venue.description}</p>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-gray-600">
                      <FaMapMarkerAlt className="text-gray-500 text-sm" />
                      <span className="text-sm font-medium">{formatAddress(venue.address)}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-600">
                      <FaClock className="text-gray-500 text-sm" />
                      <span className="text-sm">
                        {venue.openingTime} - {venue.closingTime}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-600">
                      <FaPhone className="text-gray-500 text-sm" />
                      <span className="text-sm font-medium">{venue.contactNumber}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-600">
                      <FaStar className="text-gray-500 text-sm" />
                      <span className="text-sm">Sports: {venue.sports.join(", ")}</span>
                    </div>
                  </div>
                </div>
                <div>
                  {venue.images && venue.images.length > 0 ? (
                    <img
                      src={venue.images[0]}
                      alt={venue.name}
                      className="w-full h-64 object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-200 rounded-xl flex items-center justify-center">
                      <span className="text-gray-500">No image available</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-bold text-black mb-4">Available Sections</h2>
              {sections.length === 0 ? (
                <p className="text-gray-500">No sections available for this venue.</p>
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
                      <h3 className="text-lg font-semibold text-black">{section.name}</h3>
                      <p className="text-gray-600 text-sm mt-2">{section.description}</p>
                      <div className="mt-4 space-y-2">
                        <p className="text-sm text-gray-600">Sport: {section.sport}</p>
                        <p className="text-sm text-gray-600">
                          Price: {section.basePrice} ({section.priceModel})
                        </p>
                        <p className="text-sm text-gray-600">Capacity: {section.capacity}</p>
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
                    <h3 className="text-lg font-semibold text-black mb-4">Available Slots</h3>
                    {slots.length === 0 ? (
                      <p className="text-gray-500">No slots available for this date.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {slots.map((slot) => (
                          <button
                            key={slot._id}
                            onClick={() => handleBookSlot(slot)}
                            disabled={!slot.available || isSubmitting}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                              slot.available
                                ? "bg-black text-white hover:bg-gray-800"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                          >
                            {slot.startTime} - {slot.endTime} {slot.available ? "" : "(Booked)"}
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
      </div>
    </>
  );
};

export default CustomerVenue;