import React from "react";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import logo from "../assets/images/logo.png";
import { FaPhoneAlt, FaHome } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-green-900 text-white text-sm">
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Logo and Brand */}
        <div className="flex flex-col items-start gap-2">
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="Heatn'Eat Logo"
              className="h-12 w-12 rounded-full"
            />
            <h2 className="text-xl font-bold">Heatn'Eat</h2>
          </div>
          <p className="text-gray-300">
            Ready-to-eat frozen meals packed with nutrients — just heat, eat,
            and enjoy.
          </p>
        </div>

        {/* About Us */}
        <div>
          <h3 className="font-semibold text-base mb-2">About Us</h3>
          <p className="text-gray-300">
            Heatn’Eat is your go-to source for nutritious, delicious, and
            convenient prepped frozen meals. Perfect for busy lifestyles,
            fitness goals, or just eating better — made fresh and frozen to lock
            in flavor and nutrients.
          </p>
        </div>

        {/* Contact Us */}
        <div>
          <h3 className="font-semibold text-base mb-2">Contact Us</h3>
          <p className="text-sm flex items-center gap-2 text-white">
            <FaPhoneAlt /> +94 71370 2954
          </p>
          <p className="text-sm flex items-center gap-2 text-white">
            <FaHome /> 007, Malabe, Colombo
          </p>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="font-semibold text-base mb-2">Follow Us</h3>
          <div className="flex flex-col gap-2">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300 flex items-center gap-2"
            >
              <FaFacebook size={18} /> Facebook
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300 flex items-center gap-2"
            >
              <FaInstagram size={18} /> Instagram
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300 flex items-center gap-2"
            >
              <FaTwitter size={18} /> Twitter
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-green-700 text-center py-3 text-xs text-gray-400">
        © {new Date().getFullYear()} Heatn'Eat. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
