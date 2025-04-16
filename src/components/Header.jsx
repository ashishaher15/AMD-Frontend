import React, { useEffect } from 'react';
import { assets } from '../assets/assets';
import { injectGradientAnimation } from '../utils/animations'; // Import the utility function


const Header = () => {
  useEffect(() => {
    injectGradientAnimation(); // Call the function in useEffect
  }, []);
  return (
    <div className="max-w-5xl mx-auto p-6 rounded-lg ">
    <div className="bg-gradient-to-r from-blue-500 via-blue-300 to-blue-400 py-12 px-4 md:px-24 animate-gradient bg-[length:400%_400%] rounded-lg shadow-md hover:shadow-xl transition-transform transform hover:scale-105">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="text-white text-left md:text-left">
          <p className="text-3xl md:text-4xl font-bold mb-4 ">
            Book Appointment <br />
            With Trusted Doctors
          </p>
          <img
            src={assets.group_profiles}
            alt="Group Profiles"
            className="w-24 h-auto mb-4 animate-bounce"
          />
          <p className="text-lg mb-6 text-white">Simple Browsing through doctors...</p>
          <a
            href="#ram"
            className="group relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800"
          >
            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
              <span className="flex items-center text-black">
                Book Appointment
                <img
                  src={assets.arrow_icon}
                  alt="Arrow Icon"
                  className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1 motion-reduce:transform-none"
                />
              </span>
            </span>
          </a>
        </div>
        <div className="header-image mt-8 md:mt-0">
          <img src={assets.header_img} alt="Header" className="max-w-md rounded-lg shadow-lg animate-pulse" />
        </div>
      </div>
    </div>
    </div>
  );
};

export default Header;