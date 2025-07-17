import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

export interface Section {
  _id: string;
  name: string;
  venue: string;
  sport: string;
  capacity: number;
  description?: string;
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
  name: string;
  startDate?: string;
  endDate?: string;
  days: string[];
  timings: TimingSlot[];
  duration: number;
  price: number;
  customDayPrice: { day: string; price: number }[];
  maxAdvanceBooking: number;
  isActive: boolean;
}

export interface BlockedSlot {
  _id: string;
  name: string;
  venue: string;
  section: string;
  startDate: string;
  endDate: string;
  days: string[];
  timings: TimingSlot[];
  reason: string;
  isActive: boolean;
}

// Section CRUD operations
export const createSection = async (sectionData: Omit<Section, "_id">): Promise<Section> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/sections`, sectionData);
    return response.data.section;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to create section");
  }
};

export const getVenueSections = async (venueId: string): Promise<Section[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/sections/venue/${venueId}`);
    return response.data.sections;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to fetch venue sections");
  }
};

export const getSectionById = async (sectionId: string): Promise<Section> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/sections/${sectionId}`);
    return response.data.section;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to fetch section");
  }
};

export const updateSection = async (sectionId: string, sectionData: Partial<Section>): Promise<Section> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/sections/${sectionId}`, sectionData);
    return response.data.section;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to update section");
  }
};

export const deleteSection = async (sectionId: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/sections/${sectionId}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to delete section");
  }
};

// Slot Settings operations
export const createSlotSettings = async (sectionId: string, settingsData: Omit<SlotSettings, "_id">): Promise<SlotSettings> => {
  try {
    // Map venue and section to venueId and sectionId for the API
    const formattedData = {
      ...settingsData,
      venueId: settingsData.venue, // Map venue to venueId
      sectionId: settingsData.section, // Map section to sectionId
      venue: undefined, // Remove original venue field
      section: undefined, // Remove original section field
    };
    const response = await axios.post(
      `${API_BASE_URL}/slot-settings/sections/${sectionId}/slot-settings`,
      formattedData
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to create slot settings");
  }
};

export const updateSlotSettings = async (slotSettingsId: string, settingsData: Partial<SlotSettings>): Promise<SlotSettings> => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/slot-settings/slot-settings/${slotSettingsId}`,
      settingsData
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to update slot settings");
  }
};

export const deleteSlotSettings = async (slotSettingsId: string): Promise<void> => {
  try {
    await axios.delete(
      `${API_BASE_URL}/slot-settings/slot-settings/${slotSettingsId}`
    );
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to delete slot settings");
  }
};

export const getSlotSettings = async (sectionId: string): Promise<SlotSettings[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/slot-settings/sections/${sectionId}/slot-settings`
    );
    return response.data.data || [];
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    throw new Error(error.response?.data?.error || "Failed to fetch slot settings");
  }
};

// Blocked Settings operations
export const saveBlockedSlots = async (blockedSlotData: Omit<BlockedSlot, "_id">): Promise<BlockedSlot> => {
  try {
    // Ensure the data structure matches the backend expectation
    const formattedData = {
      ...blockedSlotData,
      venueId: blockedSlotData.venue, // Align with backend field name
      sectionId: blockedSlotData.section, // Align with backend field name
      venue: undefined, // Remove original venue field
      section: undefined, // Remove original section field
    };
    const response = await axios.post(
      `${API_BASE_URL}/blocked-settings/sections/${blockedSlotData.section}/blocked-settings`,
      formattedData
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to create blocked slots");
  }
};

export const getBlockedSettings = async (sectionId: string): Promise<BlockedSlot[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/blocked-settings/sections/${sectionId}/blocked-settings`
    );
    return response.data.data || [];
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    throw new Error(error.response?.data?.error || "Failed to fetch blocked settings");
  }
};

export const updateBlockedSettings = async (blockedSettingsId: string, blockedSlotData: Partial<BlockedSlot>): Promise<BlockedSlot> => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/blocked-settings/blocked-settings/${blockedSettingsId}`,
      blockedSlotData
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to update blocked settings");
  }
};

export const deleteBlockedSettings = async (blockedSettingsId: string): Promise<void> => {
  try {
    await axios.delete(
      `${API_BASE_URL}/blocked-settings/blocked-settings/${blockedSettingsId}`
    );
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to delete blocked settings");
  }
};
