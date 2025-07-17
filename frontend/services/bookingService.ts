import axios from "axios";

interface CreateBookingParams {
  userId: string;
  sectionId: string;
  venueId: string;
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  price: number;
  venue: string;
  notes?: string;
  startTimeDate: Date;
  endTimeDate: Date;
}

export const createBooking = async (bookingData: CreateBookingParams) => {
  try {
    const formattedData = {
      user: bookingData.userId,
      section: bookingData.sectionId,
      venue: bookingData.venueId,
      slotId: bookingData.slotId,
      date: bookingData.date,
      startTime: bookingData.startTimeDate,  
      endTime: bookingData.endTimeDate,    
      duration: bookingData.duration,
      price: bookingData.price,
      notes: bookingData.notes || "",
    };

    const response = await axios.post(
      "http://localhost:5000/api/bookings",
      formattedData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.error || "Failed to create booking");
    }
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || 
                         error.response?.data?.message || 
                         "Failed to create booking";
      throw new Error(errorMessage);
    }
    throw new Error("Failed to create booking");
  }
};