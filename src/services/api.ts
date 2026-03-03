import axios from 'axios';
import { Incident, Device, AuthResponse } from '../models/types';

const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchIncidents = async (params?: any): Promise<{ incidents: Incident[], total: number }> => {
  if (IS_DEMO_MODE) {
    await sleep(300);
    const response = await fetch('/demo-data/incidents.json');
    const data = await response.json();
    
    let filtered = [...data.incidents];
    
    if (params?.species && params.species.length > 0) {
      filtered = filtered.filter(i => params.species.includes(i.species));
    }
    
    if (params?.threat_level && params.threat_level.length > 0) {
      filtered = filtered.filter(i => params.threat_level.includes(i.threat_level));
    }

    if (params?.time_range) {
      const now = Date.now();
      const ranges: Record<string, number> = {
        '1h': 3600000,
        '6h': 21600000,
        '24h': 86400000,
        '7d': 604800000
      };
      if (ranges[params.time_range]) {
        filtered = filtered.filter(i => (now - i.timestamp) <= ranges[params.time_range]);
      }
    }

    return { incidents: filtered, total: filtered.length };
  }
  
  // Real API call placeholder
  const response = await axios.get('/api/v1/incidents', { params });
  return response.data;
};

export const fetchDevices = async (): Promise<Device[]> => {
  if (IS_DEMO_MODE) {
    await sleep(200);
    const response = await fetch('/demo-data/devices.json');
    const data = await response.json();
    return data.devices;
  }
  
  const response = await axios.get('/api/v1/devices');
  return response.data.devices;
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  if (IS_DEMO_MODE) {
    await sleep(500);
    return {
      access_token: 'demo-token',
      refresh_token: 'demo-refresh',
      expires_in: 3600,
      user: {
        id: 'user_001',
        email: email || 'ranger@example.com',
        role: email.includes('admin') ? 'admin' : 'ranger'
      }
    };
  }

  const response = await axios.post('/api/v1/auth/login', { email, password });
  return response.data;
};
