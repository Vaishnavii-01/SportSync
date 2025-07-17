import { Routes, Route } from "react-router-dom";
import HomePage from "./Pages/HomePage";
import VenueDashboard from "./Pages/VenueDashboard";
import Login from "./Pages/Login";
import SignUp from "./Pages/SignUp";
import ManageVenues from "./Pages/ManageVenues";
import CustomerGrid from "./Pages/CustomerGrid";
import CustomerVenue from "./Pages/CustomerVenue";
import CustomerSettings from "./Pages/CustomerSettings";
import CustomerDashboard from "./Pages/CustomerDashboard";
import ContactPage from "./Pages/ContactPage";
import ExplorePublicGrid from "./Pages/ExplorePublicGrid";
import ManageSections from "./Pages/ManageSections";
import CustomerBookingPage from "./Pages/CustomerBookingPage";
import "../index.css";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signin" element={<SignUp />} />
        <Route path="/venue/dashboard" element={<VenueDashboard />} />
        <Route path="/venues" element={<ManageVenues />} />
        <Route path="/venues/:venueId/sections" element={<ManageSections />} />
        <Route path="/customer/search" element={<CustomerGrid />} />
        <Route path="/customer/venue/:id" element={<CustomerVenue />} />
        <Route path="/customer-booking" element={<CustomerBookingPage />} />
        <Route path="/customer/settings/:id" element={<CustomerSettings />} />
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/explore" element={<ExplorePublicGrid />} />
      </Routes>
    </>
  );
};

export default App;