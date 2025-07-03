import { useState } from "react";
import CustomerNavbar from "../Components/Navbar/CustomerNavbar";
import {
  FaMapMarkerAlt,
  FaClock,
  FaPhone,
  FaStar,
  FaCalendarAlt,
  FaUsers,
  FaChevronDown,
} from "react-icons/fa";

interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

interface SubVenue {
  id: string;
  name: string;
  sport: string;
  description: string;
  imageUrl?: string;
}

interface Slot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  available: boolean;
  subVenueId: string;
}

interface Venue {
  _id: string;
  name: string;
  description: string;
  address: Address;
  sports: string[];
  contactNumber: string;
  openingTime: string;
  closingTime: string;
  rating: number;
  capacity: number;
  facilities: string[];
  subVenues: SubVenue[];
  imageUrl?: string;
}

const CustomerVenue = () => {
  // Dummy venue data with sub-venues
  const venue: Venue = {
    _id: "1",
    name: "City Sports Complex",
    description:
      "Modern multi-sport facility with indoor and outdoor courts. Perfect for basketball, volleyball, and badminton tournaments. Our facility features professional-grade flooring, high-quality equipment, and professional staff to ensure the best sporting experience.",
    address: {
      street: "123 Sports Avenue",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      zipCode: "400001",
    },
    sports: ["Basketball", "Volleyball", "Badminton"],
    contactNumber: "+91 9876543210",
    openingTime: "06:00",
    closingTime: "22:00",
    rating: 4.7,
    capacity: 200,
    facilities: [
      "Changing Rooms",
      "Showers",
      "Equipment Rental",
      "Cafeteria",
      "Parking",
    ],
    subVenues: [
      {
        id: "sv1",
        name: "Main Basketball Court",
        sport: "Basketball",
        description:
          "Professional NBA-sized court with electronic scoreboard and spectator seating for 200 people.",
      },
      {
        id: "sv2",
        name: "Volleyball Arena",
        sport: "Volleyball",
        description:
          "Olympic-standard sand court with professional lighting and net systems.",
      },
      {
        id: "sv3",
        name: "Badminton Hall",
        sport: "Badminton",
        description:
          "Air-conditioned hall with 8 professional courts and international standard flooring.",
      },
      {
        id: "sv4",
        name: "Outdoor Multi-Sport Area",
        sport: "Multi-sport",
        description:
          "Versatile outdoor space convertible for football, cricket, and other field sports.",
      },
    ],
    imageUrl: "",
  };

  // Dummy slots data
  const slots: Slot[] = [
    {
      id: "1",
      date: "2023-06-15",
      startTime: "09:00",
      endTime: "11:00",
      price: 1500,
      available: true,
      subVenueId: "sv1",
    },
    {
      id: "2",
      date: "2023-06-15",
      startTime: "11:00",
      endTime: "13:00",
      price: 1800,
      available: true,
      subVenueId: "sv1",
    },
    {
      id: "3",
      date: "2023-06-15",
      startTime: "14:00",
      endTime: "16:00",
      price: 1500,
      available: true,
      subVenueId: "sv2",
    },
    {
      id: "4",
      date: "2023-06-15",
      startTime: "16:00",
      endTime: "18:00",
      price: 2000,
      available: false,
      subVenueId: "sv2",
    },
    {
      id: "5",
      date: "2023-06-16",
      startTime: "10:00",
      endTime: "12:00",
      price: 1600,
      available: true,
      subVenueId: "sv3",
    },
    {
      id: "6",
      date: "2023-06-16",
      startTime: "13:00",
      endTime: "15:00",
      price: 1600,
      available: true,
      subVenueId: "sv3",
    },
    {
      id: "7",
      date: "2023-06-16",
      startTime: "16:00",
      endTime: "18:00",
      price: 2200,
      available: true,
      subVenueId: "sv4",
    },
  ];

  const [selectedDate, setSelectedDate] = useState<string>("2023-06-15");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedSubVenue, setSelectedSubVenue] = useState<SubVenue | null>(
    venue.subVenues[0]
  );
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showSubVenues, setShowSubVenues] = useState(false);

  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}:00`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleSlotSelect = (slot: Slot) => {
    if (slot.available) {
      setSelectedSlot(slot);
    }
  };

  const handleBooking = () => {
    if (selectedSlot) {
      // In a real app, this would call your booking API
      console.log("Booking slot:", selectedSlot);
      setBookingSuccess(true);
      setTimeout(() => setBookingSuccess(false), 3000);
    }
  };

  // Filter slots by selected date and sub-venue
  const filteredSlots = slots.filter(
    (slot) =>
      slot.date === selectedDate && slot.subVenueId === selectedSubVenue?.id
  );

  return (
    <>
      <CustomerNavbar />
      <div className="min-h-screen bg-[#FFFFF8] pt-4 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Venue Header */}
          <div className="bg-gradient-to-r from-black to-gray-900 rounded-3xl p-8 mb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {venue.name}
                </h1>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center bg-white/20 px-3 py-1 rounded-full">
                    <FaStar className="text-yellow-400 mr-1" />
                    <span className="text-white font-medium">
                      {venue.rating.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="text-gray-300 mr-2" />
                    <span className="text-gray-300">
                      {venue.address.city}, {venue.address.state}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-2">
                {venue.sports.map((sport, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-white text-black rounded-full text-sm font-medium"
                  >
                    {sport}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Venue Details */}
            <div className="lg:col-span-2">
              {/* Venue Image */}
              <div className="bg-gradient-to-br from-gray-100 to-gray-300 rounded-2xl h-96 flex items-center justify-center mb-8">
                {venue.imageUrl ? (
                  <img
                    src={venue.imageUrl}
                    alt={venue.name}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="text-9xl">🏟️</div>
                )}
              </div>

              {/* Sub-Venues Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
                <h2 className="text-2xl font-bold text-black mb-6">
                  Available Courts & Fields
                </h2>

                <div className="space-y-6">
                  {venue.subVenues.map((subVenue) => (
                    <div
                      key={subVenue.id}
                      className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedSubVenue?.id === subVenue.id
                          ? "border-black bg-gray-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedSubVenue(subVenue)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-black mb-2">
                            {subVenue.name}
                          </h3>
                          <div className="flex items-center mb-3">
                            <span className="px-3 py-1 bg-black text-white rounded-full text-xs font-medium">
                              {subVenue.sport}
                            </span>
                          </div>
                          <p className="text-gray-600">
                            {subVenue.description}
                          </p>
                        </div>
                        {selectedSubVenue?.id === subVenue.id && (
                          <div className="bg-black text-white px-3 py-1 rounded-full text-sm">
                            Selected
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Venue Description */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
                <h2 className="text-2xl font-bold text-black mb-4">
                  About This Venue
                </h2>
                <p className="text-gray-600 mb-6">{venue.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold text-black mb-4">
                      Facilities
                    </h3>
                    <ul className="space-y-2">
                      {venue.facilities.map((facility, idx) => (
                        <li key={idx} className="flex items-center">
                          <div className="w-2 h-2 bg-black rounded-full mr-3"></div>
                          <span className="text-gray-600">{facility}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-black mb-4">
                      Opening Hours
                    </h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <FaClock className="mr-3 text-gray-500" />
                      <span>
                        {formatTime(venue.openingTime)} -{" "}
                        {formatTime(venue.closingTime)}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaUsers className="mr-3 text-gray-500" />
                      <span>Capacity: {venue.capacity} people</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-black mb-4">Location</h2>
                <div className="flex items-start mb-6">
                  <FaMapMarkerAlt className="text-gray-500 mt-1 mr-3" />
                  <div>
                    <p className="text-gray-800 font-medium">
                      {venue.address.street}
                    </p>
                    <p className="text-gray-600">
                      {venue.address.city}, {venue.address.state}{" "}
                      {venue.address.zipCode}
                    </p>
                    <p className="text-gray-600">{venue.address.country}</p>
                  </div>
                </div>
                {/* Map placeholder */}
                <div className="bg-gradient-to-br from-gray-100 to-gray-300 rounded-xl h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl mb-4">🗺️</div>
                    <p className="text-gray-600">Map of {venue.address.city}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Panel */}
            <div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sticky top-8">
                <h2 className="text-2xl font-bold text-black mb-6">
                  Book Your Slot
                </h2>

                {bookingSuccess && (
                  <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200">
                    Booking successful! Your slot has been reserved.
                  </div>
                )}

                {/* Sub-Venue Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Court/Field
                  </label>
                  <div
                    className="relative"
                    onClick={() => setShowSubVenues(!showSubVenues)}
                  >
                    <div className="flex justify-between items-center p-4 border border-gray-300 rounded-xl cursor-pointer">
                      <div>
                        <span className="font-medium text-black block">
                          {selectedSubVenue?.name}
                        </span>
                        <span className="text-sm text-gray-600">
                          {selectedSubVenue?.sport}
                        </span>
                      </div>
                      <FaChevronDown
                        className={`text-gray-500 transition-transform ${
                          showSubVenues ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    {showSubVenues && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg">
                        {venue.subVenues.map((subVenue) => (
                          <div
                            key={subVenue.id}
                            className={`p-4 cursor-pointer hover:bg-gray-50 ${
                              selectedSubVenue?.id === subVenue.id
                                ? "bg-gray-100"
                                : ""
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSubVenue(subVenue);
                              setShowSubVenues(false);
                            }}
                          >
                            <div className="font-medium text-black">
                              {subVenue.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {subVenue.sport}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Date Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Date
                  </label>
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {[
                      "2023-06-15",
                      "2023-06-16",
                      "2023-06-17",
                      "2023-06-18",
                    ].map((date) => (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap ${
                          selectedDate === date
                            ? "bg-black text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {new Date(date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slots */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Available Slots
                  </label>
                  <div className="space-y-3">
                    {filteredSlots.length > 0 ? (
                      filteredSlots.map((slot) => (
                        <div
                          key={slot.id}
                          onClick={() => handleSlotSelect(slot)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedSlot?.id === slot.id
                              ? "border-black bg-gray-50"
                              : slot.available
                              ? "border-gray-200 hover:border-gray-400"
                              : "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-medium text-black">
                                {formatTime(slot.startTime)} -{" "}
                                {formatTime(slot.endTime)}
                              </span>
                              {!slot.available && (
                                <span className="ml-2 text-red-600 text-sm">
                                  Booked
                                </span>
                              )}
                            </div>
                            <div className="font-bold text-black">
                              ₹{slot.price}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FaCalendarAlt className="text-gray-400 text-4xl mx-auto mb-4" />
                        <p className="text-gray-500">
                          No slots available for this date
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Booking Summary */}
                {selectedSlot && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="font-semibold text-black mb-3">
                      Booking Summary
                    </h3>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Court:</span>
                      <span className="text-black">
                        {selectedSubVenue?.name}
                      </span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Date:</span>
                      <span className="text-black">
                        {new Date(selectedSlot.date).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Time:</span>
                      <span className="text-black">
                        {formatTime(selectedSlot.startTime)} -{" "}
                        {formatTime(selectedSlot.endTime)}
                      </span>
                    </div>
                    <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
                      <span className="text-gray-600 font-semibold">
                        Total:
                      </span>
                      <span className="text-black font-bold">
                        ₹{selectedSlot.price}
                      </span>
                    </div>
                  </div>
                )}

                {/* Book Button */}
                <button
                  onClick={handleBooking}
                  disabled={!selectedSlot}
                  className={`w-full py-4 rounded-xl font-bold text-lg ${
                    selectedSlot
                      ? "bg-black text-white hover:bg-gray-800"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  } transition-colors`}
                >
                  {selectedSlot ? "Confirm Booking" : "Select a Slot"}
                </button>

                {/* Contact Info */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-black mb-3">Need Help?</h3>
                  <div className="flex items-center text-gray-600">
                    <FaPhone className="mr-3 text-gray-500" />
                    <span>{venue.contactNumber}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerVenue;
