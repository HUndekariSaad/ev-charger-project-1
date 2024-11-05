import React, { useEffect, useState } from 'react';
import MapboxGl, { Marker, Popup } from 'react-mapbox-gl';
import axios from 'axios';

const Mapbox = MapboxGl({
  accessToken: 'pk.eyJ1Ijoic3ViaGVuZHVtb2RhayIsImEiOiJjbG5vbXl6aDUwaXN4MnFwYmk0YTJxcmo5In0.jJIwDILn3WHq1YITs182Bw',
});

const Map = () => {
  const [chargingStations, setChargingStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryCoords, setCountryCoords] = useState(null);

  useEffect(() => {
    const fetchChargingStations = async () => {
      try {
        const response = await axios.get('https://api.openchargemap.io/v3/poi/?output=json&countrycode=US');
        setChargingStations(response.data);
      } catch (error) {
        console.error('Error fetching charging stations:', error);
      }
    };

    fetchChargingStations();
  }, []);

  useEffect(() => {
    const success = (position) => {
      const { latitude, longitude } = position.coords;
      setUserLocation({ latitude, longitude });
    };

    const error = () => {
      console.error('Error getting location');
    };

    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(success, error);
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, []);

  const fetchCountryCoords = async () => {
    try {
      const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${searchTerm}.json?access_token=pk.eyJ1Ijoic3ViaGVuZHVtb2RhayIsImEiOiJjbG5vbXl6aDUwaXN4MnFwYmk0YTJxcmo5In0.jJIwDILn3WHq1YITs182Bw`);
      if (response.data.features.length > 0) {
        const { center } = response.data.features[0]; // center gives [longitude, latitude]
        setCountryCoords({ longitude: center[0], latitude: center[1] });
      } else {
        console.error('No results found for the country.');
      }
    } catch (error) {
      console.error('Error fetching country coordinates:', error);
    }
  };






  const handleSearch = () => {
    fetchCountryCoords();
  };

  useEffect(() => {
    if (countryCoords) {
      const nearbyStations = chargingStations.filter((station) => {
        const distance = haversineDistance(
          countryCoords.latitude,
          countryCoords.longitude,
          station.Latitude,
          station.Longitude
        );
        return distance <= 20; // Filter for stations within 20 km
      });
      setFilteredStations(nearbyStations);
    }
  }, [countryCoords, chargingStations]);

  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Radius of the Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  return (
    <>
      <input
        type="text"
        placeholder="Enter country name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ padding: '10px', margin: '20px', width: '200px' }}
      />
      <button onClick={handleSearch} style={{ padding: '10px', margin: '20px' }}>
        Search
      </button>

      <Mapbox
        style="mapbox://styles/mapbox/streets-v11"
        containerStyle={{
          height: '93vh',
          width: '100%',
        }}
        center={[userLocation?.longitude || -74.006, userLocation?.latitude || 40.7128]}
        zoom={[12]}
      >
        {filteredStations.map((station) => (
          <Marker
            key={station.ID}
            coordinates={[station.Longitude, station.Latitude]}
          >
            <div style={{ background: 'green', borderRadius: '50%', width: '10px', height: '10px' }} />
          </Marker>
        ))}

        {userLocation && (
          <Marker coordinates={[userLocation.longitude, userLocation.latitude]}>
            <div style={{ background: 'blue', borderRadius: '50%', width: '15px', height: '15px' }} onClick={() => setShowPopup(true)} />
          </Marker>
        )}

        {userLocation && showPopup && (
          <Popup
            coordinates={[userLocation.longitude, userLocation.latitude]}
            onClose={() => setShowPopup(false)}
          >
            <div>
              <h4>Your Location</h4>
              <p>Longitude: {userLocation.longitude.toFixed(4)}</p>
              <p>Latitude: {userLocation.latitude.toFixed(4)}</p>
            </div>
          </Popup>
        )}
      </Mapbox>
    </>
  );
};

export default Map;
