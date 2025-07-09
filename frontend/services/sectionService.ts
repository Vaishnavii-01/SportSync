import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/sections';
const SLOT_SETTINGS_URL = 'http://localhost:5000/api/slot-settings';
const BOOKINGS_URL = 'http://localhost:5000/api/bookings';

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

export interface SlotSettingsData {
  venueId: string;
  sectionId: string;
  startDate?: string;
  endDate?: string;
  days: string[];
  timings: { startTime: string; endTime: string }[];
  duration: number;
  bookingAllowed: number;
}

export interface BookingData {
  userId: string;
  venueId: string;
  sectionId: string;
  date: string;
  startTime: string;
  endTime: string;
  slotId: string;
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

// Create or update slot settings
export const createOrUpdateSlotSettings = async (slotSettingsData: SlotSettingsData) => {
  try {
    const response = await axios.post(SLOT_SETTINGS_URL, slotSettingsData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating/updating slot settings:', error);
    throw new Error(error.response?.data?.error || 'Failed to manage slot settings');
  }
};

// Get slot settings for a section
export const getSlotSettings = async (sectionId: string) => {
  try {
    const response = await axios.get(`${SLOT_SETTINGS_URL}/section/${sectionId}`);
    return response.data.slotSettings;
  } catch (error: any) {
    console.error('Error fetching slot settings:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch slot settings');
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

// Create a booking
export const createBooking = async (bookingData: BookingData) => {
  try {
    const response = await axios.post(BOOKINGS_URL, bookingData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating booking:', error);
    throw new Error(error.response?.data?.error || 'Failed to create booking');
  }
};