import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/sections';
const SLOT_SETTINGS_URL = 'http://localhost:5000/api/slot-settings';

export interface Section {
  _id: string;
  name: string;
  venue: string;
  sport: string;
  priceModel: string;
  basePrice: number;
  capacity: number;
  description?: string;
  minimumDuration: number;
  ownerBlockedTime: string[];
  maintenanceTime: string[];
  images: string[];
  rules: string[];
  isActive: boolean;
}

export interface TimingSlot {
  startTime: string;
  endTime: string;
}

export interface SlotSettings {
  _id: string;
  venue: string;
  section: string;
  startDate?: string;
  endDate?: string;
  days: string[];
  timings: TimingSlot[];
  duration: number;
  bookingAllowed: number;
  priceModel: string;
  basePrice: number;
  isActive: boolean;
}

export const createSection = async (sectionData: Omit<Section, '_id'>): Promise<Section> => {
  try {
    const response = await axios.post(API_BASE_URL, sectionData);
    return response.data.section;
  } catch (error: any) {
    console.error('Error creating section:', error);
    throw new Error(error.response?.data?.error || 'Failed to create section');
  }
};

export const getVenueSections = async (venueId: string): Promise<Section[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/venue/${venueId}`);
    return response.data.sections;
  } catch (error: any) {
    console.error('Error fetching venue sections:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch venue sections');
  }
};

export const getSectionById = async (sectionId: string): Promise<Section> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${sectionId}`);
    return response.data.section;
  } catch (error: any) {
    console.error('Error fetching section:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch section');
  }
};

export const updateSection = async (
  sectionId: string,
  sectionData: Partial<Section>
): Promise<Section> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${sectionId}`, sectionData);
    return response.data.section;
  } catch (error: any) {
    console.error('Error updating section:', error);
    throw new Error(error.response?.data?.error || 'Failed to update section');
  }
};

export const deleteSection = async (sectionId: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/${sectionId}`);
  } catch (error: any) {
    console.error('Error deleting section:', error);
    throw new Error(error.response?.data?.error || 'Failed to delete section');
  }
};

export const createOrUpdateSlotSettings = async (
  settingsData: Omit<SlotSettings, '_id'>
): Promise<SlotSettings> => {
  try {
    const response = await axios.post(SLOT_SETTINGS_URL, settingsData);
    return response.data.slotSettings;
  } catch (error: any) {
    console.error('Error creating/updating slot settings:', error);
    throw new Error(error.response?.data?.error || 'Failed to manage slot settings');
  }
};

export const getSlotSettings = async (sectionId: string): Promise<SlotSettings | null> => {
  try {
    const response = await axios.get(`${SLOT_SETTINGS_URL}/section/${sectionId}`);
    return response.data.slotSettings[0] || null;
  } catch (error: any) {
    console.error('Error fetching slot settings:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch slot settings');
  }
};