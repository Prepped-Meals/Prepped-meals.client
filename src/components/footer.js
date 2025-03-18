import React from "react";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import logo from "../assets/images/logo.png";
// import { Link } from "react-router-dom";
// import { ROUTES } from "../routes/paths";

const Footer = () => {
  return (
    <footer className="bg-green-800 text-white mt-10">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center gap-2 mb-2">
          <img
            src={logo}
            alt="Heatn'Eat Logo"
            className="h-12 w-12 rounded-full"
          />
          <h2 className="text-xl font-bold">Heatn'Eat</h2>
        </div>{" "}
        <div>
          <p className="text-sm text-gray-300">
            © {new Date().getFullYear()} Heatn'Eat. All rights reserved.
          </p>
        </div>
        <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
          <h3 className="text-sm font-semibold mb-2">Contact Us</h3>
          <p className="text-sm mb-1">Phone: +94 71370 2954</p>
          <p className="text-sm">Address: 007, Malabe, Colombo</p>
        </div>
        <div className="flex gap-4">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300 text-sm flex items-center gap-2"
          >
            <FaFacebook size={20} /> Facebook
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300 text-sm flex items-center gap-2"
          >
            <FaInstagram size={20} /> Instagram
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300 text-sm flex items-center gap-2"
          >
            <FaTwitter size={20} /> Twitter
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
