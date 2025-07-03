import { useState, useEffect } from "react";
import CustomerNavbar from "../Components/Navbar/CustomerNavbar";
import { getVenues } from "../../services/venueService";
import { Link } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaClock,
  FaPhone,
  FaSearch,
  FaStar,
} from "react-icons/fa";

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
  rating: number;
  imageUrl?: string;
}

// Venue Card Component
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
      {/* Venue Image */}
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
            {venue.rating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Venue Details */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-black mb-2 line-clamp-1">
            {venue.name}
          </h3>
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

        {/* Action Button */}
        <Link to="/customer/venue/:id" className="">
          <button className="mt-6 w-full py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors">
            View Details & Book
          </button>
        </Link>
      </div>
    </div>
  );
};

// Temporary dummy venues for demonstration
const getDummyVenues = (): Venue[] => {
  return [
    {
      _id: "1",
      name: "City Sports Complex",
      description:
        "Modern multi-sport facility with indoor and outdoor courts. Perfect for basketball, volleyball, and badminton tournaments.",
      owner: "owner1",
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
      isActive: true,
      rating: 4.7,
      imageUrl: "",
    },
    {
      _id: "2",
      name: "Elite Cricket Ground",
      description:
        "Professional cricket ground with turf pitches and professional coaching facilities. Hosts local and regional matches.",
      owner: "owner2",
      address: {
        street: "456 Cricket Lane",
        city: "Delhi",
        state: "Delhi",
        country: "India",
        zipCode: "110001",
      },
      sports: ["Cricket"],
      contactNumber: "+91 9876543211",
      openingTime: "07:00",
      closingTime: "21:00",
      isActive: true,
      rating: 4.9,
      imageUrl: "",
    },
    {
      _id: "3",
      name: "Royal Tennis Academy",
      description:
        "Premium tennis facility with 8 clay courts and professional trainers. Ideal for both beginners and advanced players.",
      owner: "owner3",
      address: {
        street: "789 Tennis Road",
        city: "Bangalore",
        state: "Karnataka",
        country: "India",
        zipCode: "560001",
      },
      sports: ["Tennis"],
      contactNumber: "+91 9876543212",
      openingTime: "05:00",
      closingTime: "23:00",
      isActive: true,
      rating: 4.8,
      imageUrl: "",
    },
    {
      _id: "4",
      name: "Aqua Sports Center",
      description:
        "Olympic-sized swimming pool with diving facilities and professional swim coaches. Offers both recreational and competitive swimming.",
      owner: "owner4",
      address: {
        street: "101 Swimming Street",
        city: "Chennai",
        state: "Tamil Nadu",
        country: "India",
        zipCode: "600001",
      },
      sports: ["Swimming", "Diving"],
      contactNumber: "+91 9876543213",
      openingTime: "04:00",
      closingTime: "20:00",
      isActive: true,
      rating: 4.6,
      imageUrl: "",
    },
    {
      _id: "5",
      name: "Football Mania Arena",
      description:
        "FIFA-standard football field with artificial turf and floodlights. Perfect for evening matches and tournaments.",
      owner: "owner5",
      address: {
        street: "202 Football Road",
        city: "Kolkata",
        state: "West Bengal",
        country: "India",
        zipCode: "700001",
      },
      sports: ["Football"],
      contactNumber: "+91 9876543214",
      openingTime: "08:00",
      closingTime: "22:00",
      isActive: true,
      rating: 4.5,
      imageUrl: "",
    },
    {
      _id: "6",
      name: "Multi-Sport Pavilion",
      description:
        "Versatile sports complex offering facilities for badminton, table tennis, and squash. Perfect for corporate events.",
      owner: "owner6",
      address: {
        street: "303 Multi Sport Lane",
        city: "Hyderabad",
        state: "Telangana",
        country: "India",
        zipCode: "500001",
      },
      sports: ["Badminton", "Table Tennis", "Squash"],
      contactNumber: "+91 9876543215",
      openingTime: "06:00",
      closingTime: "23:00",
      isActive: true,
      rating: 4.4,
      imageUrl: "",
    },
    {
      _id: "7",
      name: "Olympic Boxing Gym",
      description:
        "Professional boxing facility with competition-grade ring and training equipment. Certified coaches available.",
      owner: "owner7",
      address: {
        street: "404 Boxing Avenue",
        city: "Pune",
        state: "Maharashtra",
        country: "India",
        zipCode: "411001",
      },
      sports: ["Boxing", "Martial Arts"],
      contactNumber: "+91 9876543216",
      openingTime: "10:00",
      closingTime: "22:00",
      isActive: true,
      rating: 4.9,
      imageUrl: "",
    },
    {
      _id: "8",
      name: "Yoga & Wellness Center",
      description:
        "Peaceful yoga studio with meditation areas and experienced instructors. Offers both group and private sessions.",
      owner: "owner8",
      address: {
        street: "505 Wellness Road",
        city: "Goa",
        state: "Goa",
        country: "India",
        zipCode: "403001",
      },
      sports: ["Yoga", "Meditation"],
      contactNumber: "+91 9876543217",
      openingTime: "05:30",
      closingTime: "20:30",
      isActive: true,
      rating: 4.8,
      imageUrl: "",
    },
  ];
};

const CustomerGrid = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch venues on component mount
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        // Try to get real venues from service
        const data = await getVenues();

        // If we get venues, use them, otherwise use dummy venues
        if (data && data.length > 0) {
          setVenues(data);
        } else {
          console.log("No venues found in service, using dummy data");
          setVenues(getDummyVenues());
        }

        setLoading(false);
      } catch (err) {
        // If service fails, use dummy venues
        console.error("Failed to fetch venues, using dummy data:", err);
        setVenues(getDummyVenues());
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  // Filter venues based on search query
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
        <CustomerNavbar />
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
        <CustomerNavbar />
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
      <CustomerNavbar />
      <div className="min-h-screen bg-[#FFFFF8] pt-4">
        {/* Search Section */}
        <div className="px-4 sm:px-8 lg:px-16 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
                Find Your Perfect Sports Venue
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Discover and book top-rated sports facilities near you
              </p>
            </div>

            {/* Search Bar */}
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

            {/* Results Info */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-black">
                {filteredVenues.length} Venues Available
              </h2>
              <div className="text-sm text-gray-600">
                Showing {filteredVenues.length} of {venues.length} venues
              </div>
            </div>

            {/* Venues Grid */}
            {filteredVenues.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No venues found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search criteria
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

export default CustomerGrid;
