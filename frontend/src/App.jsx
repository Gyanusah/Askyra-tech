import React from "react";
import Home from "./Pages/Home";
import CourseDetails from "./Pages/CourseDetails";
import Courses from "./Pages/Courses";
import Services from "./Pages/Services";
import ServiceRequest from "./Pages/ServiceRequest";
import Dashboard from "./Pages/Dashboard";
import { Route, Routes } from "react-router-dom";
import Footer from "./Components/Footer";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import Navbar from "./Components/Navbar";
import Contact from "./Pages/Contact";

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetails />} />
        <Route path="/services" element={<Services />} />
        <Route path="/service-request" element={<ServiceRequest />} />
        <Route path="/dashboard/:role" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/:role" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/:role" element={<Register />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/signup/:role" element={<Register />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
