import { useState, useEffect } from 'react';
import zoneService from '../services/zoneService';

const useZones = () => {
  const [zones, setZones] = useState([]);
  const [loadingZones, setLoadingZones] = useState(false);

  const fetchZones = async () => {
    try {
      setLoadingZones(true);
      const zonesData = await zoneService.getAllZones({ status: 'active' });
      setZones(zonesData);
    } catch (error) {
      console.error('Error fetching zones:', error);
      throw error;
    } finally {
      setLoadingZones(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  return {
    zones,
    loadingZones,
    fetchZones
  };
};

export default useZones;