import React, { createContext, useContext, useState, useEffect } from 'react';
import { Incident, Device, Species, ThreatLevel } from '../models/types';
import { fetchIncidents, fetchDevices } from '../services/api';

interface FilterState {
  species: Species[];
  time_range: string;
  threat_level: ThreatLevel[];
}

interface DataContextType {
  incidents: Incident[];
  devices: Device[];
  isLoading: boolean;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    species: [],
    time_range: '24h',
    threat_level: [],
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [incidentsRes, devicesRes] = await Promise.all([
        fetchIncidents(filters),
        fetchDevices()
      ]);
      setIncidents(incidentsRes.incidents);
      setDevices(devicesRes);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  return (
    <DataContext.Provider value={{ incidents, devices, isLoading, filters, setFilters, refreshData: loadData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
