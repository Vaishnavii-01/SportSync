import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/venues';

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  coordinates?: { lat: number; lng: number };
}

export interface Venue {
  _id: string;
  name: string;
  description: string;
  owner: string;
  address: Address;
  sports: string[];
  contactNumber: string;
  openingTime: string;
  closingTime: string;
  isActive: boolean;
  images?: string[];   
  rating?: number;
}

export const getVenues = async (): Promise<Venue[]> => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching venues:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch venues');
  }
};

export const getVenueById = async (id: string): Promise<Venue> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching venue:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch venue');
  }
};

export const createVenue = async (venueData: Omit<Venue, '_id'>): Promise<Venue> => {
  try {
    const response = await axios.post(API_BASE_URL, venueData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating venue:', error);
    throw new Error(error.response?.data?.error || 'Failed to create venue');
  }
};

export const updateVenue = async (
  id: string,
  venueData: Partial<Venue>
): Promise<Venue> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, venueData);
    return response.data;
  } catch (error: any) {
    console.error('Error updating venue:', error);
    throw new Error(error.response?.data?.error || 'Failed to update venue');
  }
};

export const deleteVenue = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/${id}`);
  } catch (error: any) {
    console.error('Error deleting venue:', error);
    throw new Error(error.response?.data?.error || 'Failed to delete venue');
  }
};