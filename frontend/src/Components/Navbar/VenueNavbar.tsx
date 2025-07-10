import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const VenueNavbar: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="w-full bg-black text-white px-8 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3 flex-shrink-0">
        <img src="/logo.png" alt="Sportsync Logo" className="h-12" />
      </div>

      <ul className="flex-1 flex justify-center gap-10 font-medium">
        <li><Link to="/venue/dashboard" className="hover:text-gray-300">Home</Link></li>
        <li><Link to="/venues" className="hover:text-gray-300">Manage Venues</Link></li>
      </ul>

      <div className="flex items-center space-x-4 relative">
        <div className="relative">
          <img
            src="/profile.png"
            alt="Profile"
            className="h-10 w-10 rounded-full cursor-pointer border-2 border-white"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />
          {dropdownOpen && (
            <div className="absolute right-0 top-12 bg-white text-black rounded-md shadow-md z-50 w-40">
              <Link
                to="/venue/profile"
                className="block px-4 py-2 hover:bg-gray-100"
                onClick={() => setDropdownOpen(false)}
              >
                View Profile
              </Link>
              <Link
                to="/"
                className="block px-4 py-2 hover:bg-gray-100"
                onClick={() => setDropdownOpen(false)}
              >
                Log Out
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default VenueNavbar;