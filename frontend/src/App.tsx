import { Routes, Route, useLocation } from "react-router-dom";
import GeneralNavbar from "./Components/Navbar/GeneralNavbar";
import VenueNavbar from "./Components/Navbar/VenueNavbar";
import HomePage from "./Pages/HomePage";
import VenueDashboard from "./Pages/VenueDashboard";
import Login from "./Pages/Login";
import SignUp from "./Pages/SignUp";
import "../index.css";

const App = () => {

  const location = useLocation();

  const isVenueDashboard = location.pathname.startsWith("/venue");

  return (
    <>
      {isVenueDashboard ? <VenueNavbar /> : <GeneralNavbar />}
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signin" element={<SignUp />} />
        <Route path="/venue/dashboard" element={<VenueDashboard />} />
      </Routes>
    </>
  );
};

export default App;
