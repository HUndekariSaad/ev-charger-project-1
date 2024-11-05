// ChargerMap.js
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const ChargerMap = () => {
  const [stations, setStations] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStations = async () => {
      const response = await axios.get('http://localhost:5000/api/chargers', {
        params: { type: filterType }
      });
      setStations(response.data);
    };
    fetchStations();
  }, [filterType]);

  // Filter stations based on search term
  const filteredStations = stations.filter(station =>
    station.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fix Leaflet marker icon issue
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
      iconUrl: require('leaflet/dist/images/marker-icon.png'),
      shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    });
  }, []);

  return (
    <div>
      <h1>Charger Stations</h1>

      <div>
        <label>
          Filter by Type:
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">All</option>
            <option value="Fast">Fast</option>
            <option value="Standard">Standard</option>
          </select>
        </label>
      </div>

      <div>
        <input
          type="text"
          placeholder="Search by station name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: "500px", width: "100%" }}>
        <TileLayer
          url="https://api.maptiler.com/maps/basic-v2/256/{z}/{x}/{y}.png?key=kQJDFpaeYEDmgiHWbqfJ"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {filteredStations.map(station => (
          <Marker key={station.id} position={[station.latitude, station.longitude]}>
            <Popup>
              {station.name} <br /> {station.location}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ChargerMap;
