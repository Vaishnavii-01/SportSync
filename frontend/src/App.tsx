<<<<<<< HEAD
import GeneralNavbar from "./Components/Navbar/GeneralNavbar";
import HomePage from "./Pages/HomePage";

function App() {
  return (
    <>
      fuck u
      <HomePage />
      <GeneralNavbar />
    </>
  );
}

export default App;
=======
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import GeneralNavbar from './Components/Navbar/GeneralNavbar';
import HomePage from './Pages/HomePage';

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
>>>>>>> 6656b1e40d599ce8f883e126306ff713973bdfcf
