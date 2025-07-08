import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/venues';

export const getVenues = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching venues:', error);
    throw error;
  }
};

export const getVenueById = async (id: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching venue:', error);
    throw error;
  }
};

export const createVenue = async (venueData: any) => {
  try {
    const response = await axios.post(API_BASE_URL, venueData);
    return response.data;
  } catch (error) {
    console.error('Error creating venue:', error);
    throw error;
  }
};

export const updateVenue = async (id: string, venueData: any) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, venueData);
    return response.data;
  } catch (error) {
    console.error('Error updating venue:', error);
    throw error;
  }
};

export const deleteVenue = async (id: string) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting venue:', error);
    throw error;
  }
};