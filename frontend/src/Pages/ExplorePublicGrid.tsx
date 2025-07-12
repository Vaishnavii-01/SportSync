import { useState, useEffect } from "react";
import GeneralNavbar from "../Components/Navbar/GeneralNavbar";
import { getVenues } from "../../services/venueService";
import { FaMapMarkerAlt, FaClock, FaPhone, FaSearch, FaStar } from "react-icons/fa";

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
  rating?: number;
  imageUrl?: string;
}

const VenueCard = ({ venue }: { venue: Venue }) => {
  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}:00`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-300 relative">
        {venue.imageUrl ? (
          <img
            src={venue.imageUrl}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-5xl">🏟️</div>
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center">
          <FaStar className="text-yellow-500 mr-1" />
          <span className="font-semibold text-black">
            {(venue.rating || 0).toFixed(1)}
          </span>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-black mb-2 line-clamp-1">{venue.name}</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {venue.sports.map((sport, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full"
              >
                {sport}
              </span>
            ))}
          </div>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {venue.description}
          </p>
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex items-center text-gray-600">
            <FaMapMarkerAlt className="text-gray-500 mr-3 flex-shrink-0" />
            <span className="text-sm truncate">
              {venue.address.street}, {venue.address.city}
            </span>
          </div>

          <div className="flex items-center text-gray-600">
            <FaClock className="text-gray-500 mr-3 flex-shrink-0" />
            <span className="text-sm">
              {formatTime(venue.openingTime)} - {formatTime(venue.closingTime)}
            </span>
          </div>

          <div className="flex items-center text-gray-600">
            <FaPhone className="text-gray-500 mr-3 flex-shrink-0" />
            <span className="text-sm font-medium">{venue.contactNumber}</span>
          </div>
        </div>

        <button
          onClick={() => alert("Please log in or sign up to view details and book this venue.")}
          className="mt-6 w-full py-3 bg-gray-400 text-white rounded-xl font-semibold cursor-not-allowed"
        >
          View Details & Book
        </button>
      </div>
    </div>
  );
};

const ExplorePublicGrid = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const data = await getVenues();
        setVenues(data);
        setLoading(false);
      } catch (err: any) {
        console.error("Failed to fetch venues:", err);
        setError(err.response?.data?.error || "Failed to load venues. Please try again later.");
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  const filteredVenues = venues.filter(
    (venue) =>
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.sports.some((sport) =>
        sport.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      venue.address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.address.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <>
        <GeneralNavbar />
        <div className="min-h-screen bg-[#FFFFF8] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading venues...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <GeneralNavbar />
        <div className="min-h-screen bg-[#FFFFF8] flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-xl shadow-sm max-w-md">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Error loading venues
            </h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <GeneralNavbar />
      <div className="min-h-screen bg-[#FFFFF8] pt-4">
        <div className="px-4 sm:px-8 lg:px-16 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
                Explore Sports Venues
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Discover top-rated facilities. Log in to book your slot.
              </p>
            </div>

            <div className="max-w-2xl mx-auto mb-16">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-500" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search venues by name, sport, or location..."
                  className="w-full pl-12 pr-6 py-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-black">
                {filteredVenues.length} Venues Available
              </h2>
              <div className="text-sm text-gray-600">
                Showing {filteredVenues.length} of {venues.length} venues
              </div>
            </div>

            {filteredVenues.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No venues found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search criteria or check back later
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredVenues.map((venue) => (
                  <VenueCard key={venue._id} venue={venue} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ExplorePublicGrid;