import {
  Star,
  Users,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from "lucide-react";
import GeneralNavbar from "../Components/Navbar/GeneralNavbar";

const HomePage = () => {
  const sports = [
    { name: "Tennis", venues: "15 venues", icon: "🎾", color: "bg-pink-100" },
    { name: "Football", venues: "8 venues", icon: "⚽", color: "bg-blue-100" },
    {
      name: "Basketball",
      venues: "12 venues",
      icon: "🏀",
      color: "bg-orange-100",
    },
    {
      name: "Badminton",
      venues: "20 venues",
      icon: "🏸",
      color: "bg-green-100",
    },
    { name: "Cricket", venues: "6 venues", icon: "🏏", color: "bg-red-100" },
    { name: "Swimming", venues: "4 venues", icon: "🏊", color: "bg-blue-100" },
    {
      name: "Volleyball",
      venues: "10 venues",
      icon: "🏐",
      color: "bg-purple-100",
    },
    {
      name: "Table Tennis",
      venues: "18 venues",
      icon: "🏓",
      color: "bg-pink-100",
    },
  ];

  const venues = [
    {
      name: "Elite Tennis Courts",
      price: "₹1,200/hr",
      rating: 4.8,
      location: "Bandra",
      facilities: ["Floodlights", "AC Changing Rooms", "Pro Shop"],
      icon: "🎾",
      color: "bg-pink-100",
    },
    {
      name: "Champions Football Ground",
      price: "₹2,500/hr",
      rating: 4.9,
      location: "Andheri",
      facilities: ["Natural Grass", "Parking", "Floodlights"],
      icon: "⚽",
      color: "bg-blue-100",
    },
    {
      name: "Ace Badminton Arena",
      price: "₹800/hr",
      rating: 4.7,
      location: "Powai",
      facilities: ["AC Courts", "Equipment Rental", "Cafeteria"],
      icon: "🏸",
      color: "bg-green-100",
    },
    {
      name: "Slam Basketball Court",
      price: "₹1,500/hr",
      rating: 4.6,
      location: "Malad",
      facilities: ["Indoor Court", "Scoreboard"],
      icon: "🏀",
      color: "bg-orange-100",
    },
    {
      name: "Precision Cricket Nets",
      price: "₹1,000/hr",
      rating: 4.5,
      location: "Goregaon",
      facilities: ["Bowling Machine", "Net Wicket", "Coaching"],
      icon: "🏏",
      color: "bg-red-100",
    },
    {
      name: "Splash Swimming Pool",
      price: "₹600/hr",
      rating: 4.8,
      location: "Juhu",
      facilities: ["Olympic Size", "Heated Pool", "Jacuzzi"],
      icon: "🏊",
      color: "bg-blue-100",
    },
  ];

  return (
    <>
      <GeneralNavbar />
      <div className="min-h-screen" style={{ backgroundColor: "#FFFFF8" }}>
        {/* Hero Section */}
        <div className="py-16 px-4" style={{ backgroundColor: "#FFFFF8" }}>
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl font-bold text-black mb-6 leading-tight">
                  Book Your
                  <br />
                  Favorite
                  <br />
                  Sports Venue
                  <br />
                  Instantly!
                </h1>
                <p className="text-gray-600 mb-8 text-lg">
                  Find and book the perfect sports venue for your next game or
                  event with ease. Browse through a wide selection of venues and
                  secure your spot in just a few clicks.
                </p>
                <div className="flex gap-4">
                  <button className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                    📍 Book Now
                  </button>
                  <button className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                    ▶ Watch Demo
                  </button>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gray-100 rounded-2xl p-8 relative">
                  <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 rounded-full text-sm">
                    Available Today
                  </div>
                  <div className="text-6xl mb-4">🏀</div>
                  <h3 className="text-xl font-bold mb-2">
                    Premium Sports Complex
                  </h3>
                  <div className="flex items-center mb-4">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm font-medium">4.9</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-12">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-600" />
                <span className="font-bold text-2xl">500+</span>
                <span className="text-gray-600">Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                <span className="font-bold text-2xl">10K+</span>
                <span className="text-gray-600">Bookings</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <span className="font-bold text-2xl">15+</span>
                <span className="text-gray-600">Years</span>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Sports Section */}
        <div className="py-16 px-4 " style={{ backgroundColor: "#FFFFF8" }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-black mb-4">
                Popular Sports
              </h2>
              <p className="text-gray-600">
                Choose from a variety of sports and find the perfect venue for
                your activity
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {sports.map((sport, index) => (
                <div key={index} className="text-center group cursor-pointer">
                  <div
                    className={`w-20 h-20 ${sport.color} rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}
                  >
                    <span className="text-3xl">{sport.icon}</span>
                  </div>
                  <h3 className="font-semibold text-black mb-1">
                    {sport.name}
                  </h3>
                  <p className="text-sm text-gray-500">{sport.venues}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Popular Venues Section */}
        <div className="py-16 px-4" style={{ backgroundColor: "#FFFFF8" }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-black mb-4">
                Explore Popular Venues
              </h2>
              <p className="text-gray-600">
                Discover top-rated venues in your area with excellent facilities
                and amenities
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map((venue, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={`w-12 h-12 ${venue.color} rounded-xl flex items-center justify-center`}
                    >
                      <span className="text-2xl">{venue.icon}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">
                        {venue.rating}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-black mb-2">
                    {venue.name}
                  </h3>
                  <p className="text-2xl font-bold text-black mb-3">
                    {venue.price}
                  </p>

                  <div className="flex items-center gap-1 mb-4">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {venue.location}
                    </span>
                  </div>

                  <div className="space-y-1 mb-6">
                    {venue.facilities.map((facility, idx) => (
                      <span
                        key={idx}
                        className="inline-block text-xs text-gray-600 mr-3"
                      >
                        {facility}
                      </span>
                    ))}
                  </div>

                  <button className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                    Book Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Why Choose SportSync Section */}
        <div className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-black mb-4">
                Why Choose SportSync?
              </h2>
              <p className="text-gray-600">
                We make booking sports venues simple, fast, and reliable
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-black mb-3">
                  Instant Booking
                </h3>
                <p className="text-gray-600">
                  Book your favorite sports venue with just a few clicks.
                  Real-time availability and instant confirmations.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-black mb-3">
                  Verified Venues
                </h3>
                <p className="text-gray-600">
                  All venues are verified and rated by our community of sports
                  enthusiasts. Quality guaranteed.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-black mb-3">
                  Best Prices
                </h3>
                <p className="text-gray-600">
                  Get competitive prices on premium venues across the city. No
                  hidden costs or booking fees.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-black text-white py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center mr-3">
                    <div className="w-4 h-4 border-2 border-black rounded-full relative">
                      <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-black rounded-full"></div>
                    </div>
                  </div>
                  <span className="text-xl font-bold">SportSync</span>
                </div>
                <p className="text-gray-400 mb-4">
                  Your trusted partner for booking sports venues. Play smart,
                  book smarter with SportSync.
                </p>
                <div className="flex gap-3">
                  <Facebook className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                  <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                  <Instagram className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                  <Youtube className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <a href="#" className="hover:text-white">
                      Home
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      Venues
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      Sports
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      Booking
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      About
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <a href="#" className="hover:text-white">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      Contact Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      FAQ
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      Terms of Service
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      Privacy Policy
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
                <div className="space-y-3 text-gray-400">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>hello@sportsync.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>+91 98765 43210</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>Mumbai, Maharashtra</span>
                  </div>
                  <p className="text-sm">Mon-Sat: 9:00 AM - 10:00 PM</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>© 2024 SportSync. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HomePage;
