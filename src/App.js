


import React, {useState,useEffect } from "react";
import Map from './components/Map';

function App() {

  const dataFunction = async () => {
    try {
      const response = await fetch(
        "/api/aggregator/nearby?latitude=36.778259&longitude=-119.417931&radius=50&maxResults=10&offset=0",
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  useEffect(() => {
    dataFunction();
  }, [])

  const latitude = 36.778259; // Example latitude
  const longitude = -119.417931; // Example longitude
  return (
    <div style={{ width: "100%", height: "100%" }}>
    <Map longitude={longitude} latitude={latitude} />
  </div>

  );
}

export default App;
