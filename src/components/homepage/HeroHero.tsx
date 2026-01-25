"use client";

import React from "react";
import { Search, Calendar, Users, MapPin } from "lucide-react";

const HeroHero = () => {
  return (
    <section className="relative h-[500px] md:h-[600px] w-full">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1615571022219-eb45cf7faa9d?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Beautiful vacation home"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-8 tracking-tight">
          Find your place for together
        </h1>
        <div className="w-full max-w-5xl bg-white rounded-xl shadow-2xl p-2 md:p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div className="flex items-center gap-3 px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200">
              <MapPin className="text-gray-400" size={20} />
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold text-gray-400">Where</p>
                <input 
                  type="text" 
                  placeholder="Search destination" 
                  className="w-full outline-none text-sm font-medium text-gray-700 placeholder:text-gray-400"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200">
              <Calendar className="text-gray-400" size={20} />
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold text-gray-400">Dates</p>
                <p className="text-sm font-medium text-gray-400">Select dates</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <Users className="text-gray-400" size={20} />
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold text-gray-400">Travelers</p>
                <p className="text-sm font-medium text-gray-400">Add guests</p>
              </div>
            </div>
            <div className="flex items-center">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                <Search size={20} />
                Search
              </button>
            </div>

          </div>
        </div>
        <p className="mt-6 text-white font-medium drop-shadow-md">
          Over 2 million vacation rentals worldwide
        </p>
      </div>
    </section>
  );
};

export default HeroHero;