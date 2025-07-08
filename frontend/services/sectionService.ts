import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/sections';
const SLOT_SETTINGS_URL = 'http://localhost:5000/api/slot-settings';

export interface SectionData {
  name: string;
  venue: string;
  sport: string;
  priceModel: string;
  basePrice: number;
  capacity: number;
  description?: string;
  images?: string[];
  rules?: string[];
}

// Create a new section
export const createSection = async (sectionData: SectionData) => {
  try {
    const response = await axios.post(API_BASE_URL, sectionData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating section:', error);
    throw new Error(error.response?.data?.error || 'Failed to create section');
  }
};

// Get all sections for a venue
export const getVenueSections = async (venueId: string, sport?: string) => {
  try {
    const url = sport
      ? `${API_BASE_URL}/venue/${venueId}?sport=${encodeURIComponent(sport)}`
      : `${API_BASE_URL}/venue/${venueId}`;
    const response = await axios.get(url);
    return response.data.sections;
  } catch (error: any) {
    console.error('Error fetching venue sections:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch venue sections');
  }
};

// Get section by ID
export const getSectionById = async (sectionId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${sectionId}`);
    return response.data.section;
  } catch (error: any) {
    console.error('Error fetching section:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch section');
  }
};

// Update a section
export const updateSection = async (sectionId: string, sectionData: Partial<SectionData>) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${sectionId}`, sectionData);
    return response.data;
  } catch (error: any) {
    console.error('Error updating section:', error);
    throw new Error(error.response?.data?.error || 'Failed to update section');
  }
};

// Delete a section
export const deleteSection = async (sectionId: string) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${sectionId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting section:', error);
    throw new Error(error.response?.data?.error || 'Failed to delete section');
  }
};

// Get available slots for a section on a specific date
export const getAvailableSlots = async (sectionId: string, date: string) => {
  try {
    const response = await axios.get(
      `${SLOT_SETTINGS_URL}/available-slots?sectionId=${sectionId}&date=${date}`
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching available slots:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch available slots');
  }
};