"use client";
import { GetStocks } from "@/app/api/stocks/gainers/route";
import { useState, useEffect } from "react";
const Features = () => {
  useEffect(() => {
    const fetchGainers = async () => {
      const request = await fetch("/api/stocks/gainers");
      const data = await request.json();
      console.log(data);
    };
    fetchGainers()
  }, []);
  return (
    <section>
      <div className="flex justify-center items-center gap-4 mx-6">
        <div className="h-200 w-full rounded-xl border border-gray-50"></div>
        <div className="h-200 w-full rounded-xl border border-gray-50"></div>
      </div>
      <div className="h-100 rounded-xl border border-gray-50 mx-6 mt-4"></div>
    </section>
  );
};

export default Features;
