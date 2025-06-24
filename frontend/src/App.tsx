import { Routes, Route } from "react-router-dom";
import GeneralNavbar from "./Components/Navbar/GeneralNavbar";
import HomePage from "./Pages/HomePage";

const App = () => {
  return (
    <>
      <GeneralNavbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </>
  );
};

export default App;
