import React from "react";
import "../styles/HomePage.css";

const HomePage = () => {
  const popularVenues = [
    {
      id: 1,
      name: "Elite Tennis Courts",
      sport: "Tennis",
      location: "Downtown",
      rating: 4.8,
      price: "₹1,200/hr",
      features: ["Floodlights", "AC Changing Rooms", "Pro Shop"],
    },
    {
      id: 2,
      name: "Champions Football Ground",
      sport: "Football",
      location: "South Mumbai",
      rating: 4.9,
      price: "₹2,500/hr",
      features: ["Natural Grass", "Parking", "Floodlights"],
    },
    {
      id: 3,
      name: "Ace Badminton Arena",
      sport: "Badminton",
      location: "Andheri",
      rating: 4.7,
      price: "₹800/hr",
      features: ["AC Courts", "Equipment Rental", "Cafeteria"],
    },
    {
      id: 4,
      name: "Slam Basketball Court",
      sport: "Basketball",
      location: "Bandra",
      rating: 4.6,
      price: "₹1,500/hr",
      features: ["Indoor Court", "Scoreboard", "Locker Rooms"],
    },
    {
      id: 5,
      name: "Precision Cricket Nets",
      sport: "Cricket",
      location: "Powai",
      rating: 4.8,
      price: "₹1,000/hr",
      features: ["Bowling Machine", "Turf Wicket", "Coaching"],
    },
    {
      id: 6,
      name: "Splash Swimming Pool",
      sport: "Swimming",
      location: "Juhu",
      rating: 4.9,
      price: "₹600/hr",
      features: ["Olympic Size", "Heated Pool", "Jacuzzi"],
    },
  ];

  const sports = [
    { name: "Tennis", icon: "🎾", count: "24 venues" },
    { name: "Football", icon: "⚽", count: "18 venues" },
    { name: "Basketball", icon: "🏀", count: "15 venues" },
    { name: "Badminton", icon: "🏸", count: "32 venues" },
    { name: "Cricket", icon: "🏏", count: "12 venues" },
    { name: "Swimming", icon: "🏊", count: "8 venues" },
    { name: "Volleyball", icon: "🏐", count: "9 venues" },
    { name: "Table Tennis", icon: "🏓", count: "14 venues" },
  ];

  const features = [
    {
      icon: "⚡",
      title: "Instant Booking",
      description:
        "Book your favorite venue in just a few clicks. Real-time availability and instant confirmation.",
    },
    {
      icon: "✓",
      title: "Verified Venues",
      description:
        "All venues are verified and rated by our community of sports enthusiasts. Quality guaranteed.",
    },
    {
      icon: "★",
      title: "Best Prices",
      description:
        "Get exclusive deals on premium sports venues across the city. No hidden charges.",
    },
  ];

  return (
    <div className="app">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text animate-fadeIn">
              <h1 className="hero-title animate-fadeIn delay-200">
                Book Your Favorite
                <br />
                Sports Venue
                <br />
                Instantly!
              </h1>
              <p className="hero-subtitle animate-fadeIn delay-300">
                Find and book the perfect sports venue for your next game or
                event with ease. Browse through a wide selection of venues and
                secure your spot in just a few clicks.
              </p>
              <div className="hero-buttons animate-fadeIn delay-400">
                <button className="btn btn-primary btn-large">
                  <span>📅</span>
                  <span>Book Now</span>
                  <span>→</span>
                </button>
                <a href="#demo" className="btn btn-secondary btn-large">
                  <span>▶</span>
                  <span>Watch Demo</span>
                </a>
              </div>
              <div className="hero-stats animate-fadeIn delay-500">
                <div className="stat">
                  <div className="stat-icon">🏟️</div>
                  <div>
                    <div className="stat-number">500+</div>
                    <div className="stat-label">Venues</div>
                  </div>
                </div>
                <div className="stat">
                  <div className="stat-icon">👥</div>
                  <div>
                    <div className="stat-number">10K+</div>
                    <div className="stat-label">Happy Users</div>
                  </div>
                </div>
                <div className="stat">
                  <div className="stat-icon">🏅</div>
                  <div>
                    <div className="stat-number">15+</div>
                    <div className="stat-label">Sports</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="hero-visual animate-fadeIn delay-300">
              <div className="hero-card floating">
                <div className="hero-card-image">
                  <div className="hero-card-badge">Available Now</div>
                  🏀
                </div>
                <div className="hero-card-content">
                  <div className="hero-card-info">
                    <h3>Premium Sports Complex</h3>
                    <p>
                      <span>📍</span>
                      <span>Bandra, Mumbai</span>
                    </p>
                  </div>
                  <div className="hero-card-rating">
                    <span>★</span>
                    <span>4.9</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sports Categories */}
      <section className="sports-section" id="sports">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Popular Sports</h2>
            <p className="section-subtitle">
              Choose from a variety of sports and find the perfect venue for
              your activity
            </p>
          </div>
          <div className="sports-grid">
            {sports.map((sport, index) => (
              <div
                key={index}
                className="sport-card animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="sport-icon">{sport.icon}</span>
                <h3 className="sport-name">{sport.name}</h3>
                <p className="sport-count">{sport.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Venues */}
      <section className="venues-section" id="venues">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Explore Popular Venues</h2>
            <p className="section-subtitle">
              Discover top-rated venues in your area with excellent facilities
              and amenities
            </p>
          </div>
          <div className="venues-grid">
            {popularVenues.map((venue, index) => (
              <div
                key={venue.id}
                className="venue-card animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="venue-image">
                  {venue.sport === "Tennis" && "🎾"}
                  {venue.sport === "Football" && "⚽"}
                  {venue.sport === "Badminton" && "🏸"}
                  {venue.sport === "Basketball" && "🏀"}
                  {venue.sport === "Cricket" && "🏏"}
                  {venue.sport === "Swimming" && "🏊"}
                  <div className="venue-rating">
                    <span>★</span>
                    <span>{venue.rating}</span>
                  </div>
                </div>
                <div className="venue-content">
                  <div className="venue-header">
                    <div className="venue-info">
                      <h3>{venue.name}</h3>
                      <div className="venue-location">
                        <span>📍</span>
                        <span>{venue.location}</span>
                      </div>
                    </div>
                    <div className="venue-price">
                      <div className="venue-price-amount">{venue.price}</div>
                      <div className="venue-sport">{venue.sport}</div>
                    </div>
                  </div>
                  <div className="venue-features">
                    {venue.features.map((feature, index) => (
                      <span key={index} className="feature-tag">
                        {feature}
                      </span>
                    ))}
                  </div>
                  <button className="venue-book-btn">Book Now</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose SportSync?</h2>
            <p className="section-subtitle">
              We make booking sports venues simple, fast, and reliable
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <div className="footer-logo-icon">🏆</div>
                <span style={{ fontSize: "22px", fontWeight: "bold" }}>
                  SportSync
                </span>
              </div>
              <p>
                Your trusted partner for booking sports venues across Mumbai.
                Find, book, and play at the best sports facilities in the city.
              </p>
              <div className="footer-social">
                <a href="#" className="social-icon">
                  f
                </a>
                <a href="#" className="social-icon">
                  t
                </a>
                <a href="#" className="social-icon">
                  in
                </a>
                <a href="#" className="social-icon">
                  ig
                </a>
              </div>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <a href="#home">Home</a>
              <a href="#venues">Venues</a>
              <a href="#sports">Sports</a>
              <a href="#features">Features</a>
              <a href="#about">About</a>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <a href="#help">Help Center</a>
              <a href="#contact">Contact Us</a>
              <a href="#faq">FAQs</a>
              <a href="#terms">Terms of Service</a>
              <a href="#privacy">Privacy Policy</a>
            </div>
            <div className="footer-section">
              <h4>Contact Info</h4>
              <p>📧 hello@sportsync.com</p>
              <p>📞 +91 98765 43210</p>
              <p>📍 Mumbai, Maharashtra</p>
              <p>🕒 Mon-Sun: 7:00 AM - 10:00 PM</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 SportSync. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
