import { Routes, Route } from "react-router-dom";
import GeneralNavbar from "./Components/Navbar/GeneralNavbar";
import HomePage from "./Pages/HomePage";
import Login from "./Pages/Login";
import SignUp from "./Pages/SignUp";
import "../index.css";

const App = () => {
  return (
    <>
      <GeneralNavbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signin" element={<SignUp />} />
      </Routes>
    </>
  );
};

export default App;
