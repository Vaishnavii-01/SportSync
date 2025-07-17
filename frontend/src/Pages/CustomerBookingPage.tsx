import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { createBooking } from "../../services/bookingService";
import CustomerNavbar from "../Components/Navbar/CustomerNavbar";
import Footer from "../Components/Footer/VOFooter";
import { FaMapMarkerAlt, FaClock, FaPhone, FaArrowLeft, FaCheckCircle } from "react-icons/fa";

interface Slot {
  slotId: string;
  sectionId: string;
  sectionName: string;
  venueId: string;
  venueName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  price: number;
  settingName: string;
}

interface Venue {
  _id: string;
  name: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  contactNumber: string;
  openingTime: string;
  closingTime: string;
  sports: string[];
  images: string[];
}

interface Section {
  _id: string;
  name: string;
  sport: string;
  capacity: number;
  description?: string;
  rules?: string[];
}

const CustomerBookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [userId] = useState<string | null>("6863d1cfa8d1e82535f71e3f");
  const [venue, setVenue] = useState<Venue | null>(null);
  const [section, setSection] = useState<Section | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);

  useEffect(() => {
    if (!location.state) {
      setError("Invalid booking information");
      return;
    }

    const { slot, venue, section } = location.state;
    if (!slot || !venue || !section) {
      setError("Required booking information is missing");
      return;
    }

    setSlot(slot);
    setVenue(venue);
    setSection(section);
  }, [location.state]);

  const handleConfirmBooking = async () => {
    if (!slot || !section || !venue || !userId) {
      setError("Missing required booking information");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const startTimeDate = new Date(`${slot.date}T${slot.startTime}:00`);
      const endTimeDate = new Date(`${slot.date}T${slot.endTime}:00`);
      
      const bookingData = {
        userId,
        sectionId: section._id,
        venueId: venue._id,
        slotId: slot.slotId,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        duration: slot.duration,
        price: slot.price,
        venue: venue._id,
        notes: "",
        startTimeDate, 
        endTimeDate,   
      };

      console.log("Submitting booking data:", bookingData);

      const response = await createBooking(bookingData);

      if (response.success) {
        setBookingSuccess(true);
        navigate(`/customer/venue/${venue._id}`, {
          state: { 
            bookingSuccess: true,
            bookedSlotId: slot.slotId,
            bookedDate: slot.date
          },
          replace: true
        });
      } else {
        throw new Error(response.error || "Failed to create booking");
      }
    } catch (err) {
      console.error("Booking error:", err);
      setError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return `₹${price.toFixed(2)}`;
  };

  const formatAddress = (address: Venue["address"]) => {
    return `${address.street}, ${address.city}, ${address.state}, ${address.country} ${address.zipCode}`;
  };

  if (error || !slot || !venue || !section) {
    return (
      <div className="min-h-screen bg-[#FFFFF8] flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {error || "Booking information not available"}
          </h3>
          <Link
            to="/customer/search"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            <span>Back to Venues</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <CustomerNavbar />
      <div className="min-h-screen bg-[#FFFFF8]">
        <div className="px-6 sm:px-12 lg:px-20 py-12">
          <div className="max-w-4xl mx-auto">
            <Link
              to={`/customer/venue/${venue._id}`}
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-black mb-6"
            >
              <FaArrowLeft />
              <span>Back to venue</span>
            </Link>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
              <h1 className="text-3xl font-bold text-black mb-6">
                Confirm Your Booking
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-semibold text-black mb-4">
                    Venue Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-black">
                        {venue.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {formatAddress(venue.address)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 text-gray-600">
                      <FaPhone className="text-gray-500 text-sm" />
                      <span className="text-sm font-medium">
                        {venue.contactNumber}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-gray-600">
                      <FaClock className="text-gray-500 text-sm" />
                      <span className="text-sm">
                        {venue.openingTime} - {venue.closingTime}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-black mb-4">
                    Booking Details
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-black">
                        {section.name} ({section.sport})
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {section.description || "No description available"}
                      </p>
                    </div>

                    <div>
                      <p className="text-black font-medium">
                        {slot.date} • {slot.startTime} - {slot.endTime}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Duration: {slot.duration} minutes
                      </p>
                    </div>

                    <div>
                      <p className="text-black font-medium">
                        Total: {formatPrice(slot.price)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-black mb-4">
                Payment Information
              </h2>
              <p className="text-gray-600 mb-6">
                Payment will be processed securely. You'll receive a confirmation
                email with your booking details.
              </p>

              <button
                onClick={handleConfirmBooking}
                disabled={isSubmitting || bookingSuccess}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  !isSubmitting && !bookingSuccess
                    ? "bg-black text-white hover:bg-gray-800"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? "Processing..." : 
                 bookingSuccess ? "Booking Confirmed!" : "Confirm & Pay"}
              </button>

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
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CustomerBookingPage;