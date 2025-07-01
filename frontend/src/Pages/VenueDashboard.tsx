import React, { useState } from 'react';
import { FaDownload } from 'react-icons/fa';
import VOFooter from '../Components/Footer/VOFooter';

interface Slot {
  id: string;
  venueName: string;
  sport: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  duration: number;
  status: 'Available' | 'Booked';
}

const VenueDashboard: React.FC = () => {
  const [stats] = useState({
    totalVenues: 3,
    todaysBookings: 25,
    averageRating: 4.8,
    monthlyRevenue: 13500,
  });

  const [slots, setSlots] = useState<Slot[]>([
    {
      id: 'SLOT01',
      venueName: 'VESIT Turf',
      sport: 'Football',
      date: '2025-07-02',
      startTime: '16:00',
      endTime: '17:00',
      price: 1500,
      duration: 60,
      status: 'Booked',
    },
    {
      id: 'SLOT02',
      venueName: 'Elite Court',
      sport: 'Badminton',
      date: '2025-07-02',
      startTime: '17:00',
      endTime: '17:30',
      price: 500,
      duration: 30,
      status: 'Available',
    },
    {
      id: 'SLOT03',
      venueName: 'Pool Side',
      sport: 'Swimming',
      date: '2025-07-02',
      startTime: '18:00',
      endTime: '19:00',
      price: 800,
      duration: 60,
      status: 'Booked',
    },
  ]);

  return (
    <>
    <div className="bg-[#FFFFF8] min-h-screen">
      <section className="py-8 px-6 sm:px-20 grid grid-cols-2 sm:grid-cols-4 gap-6">
        <div className="bg-white shadow-md rounded-lg text-center py-6">
          <div className="text-2xl font-bold">{stats.totalVenues}</div>
          <p className="text-sm text-gray-600 mt-2">Total Venues</p>
        </div>
        <div className="bg-white shadow-md rounded-lg text-center py-6">
          <div className="text-2xl font-bold">{stats.todaysBookings}</div>
          <p className="text-sm text-gray-600 mt-2">Today's Bookings</p>
        </div>
        <div className="bg-white shadow-md rounded-lg text-center py-6">
          <div className="text-2xl font-bold">{stats.averageRating}</div>
          <p className="text-sm text-gray-600 mt-2">Average Rating</p>
        </div>
        <div className="bg-white shadow-md rounded-lg text-center py-6">
          <div className="text-2xl font-bold">₹{stats.monthlyRevenue}</div>
          <p className="text-sm text-gray-600 mt-2">Monthly Revenue</p>
        </div>
      </section>

      <div className="flex justify-center items-center mt-6">
        <button className="flex items-center gap-2 px-6 py-2 bg-[#ffecec] text-black rounded-lg font-semibold hover:bg-[#f7dbdb] shadow-sm">
          GET PREVIOUS MONTH’S REPORT
          <FaDownload />
        </button>
      </div>

      <div className="px-4 sm:px-20 mt-10">
        <div className="overflow-x-auto rounded-xl shadow-md">
          <table className="min-w-full bg-white text-sm border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-gray-700 font-semibold">
                <th className="px-4 py-3">Slot ID</th>
                <th className="px-4 py-3">Venue</th>
                <th className="px-4 py-3">Sport</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot.id} className="bg-[#fffaf4]">
                  <td className="px-4 py-3 font-medium">{slot.id}</td>
                  <td className="px-4 py-3">{slot.venueName}</td>
                  <td className="px-4 py-3">{slot.sport}</td>
                  <td className="px-4 py-3">{slot.date}</td>
                  <td className="px-4 py-3">
                    {slot.startTime} - {slot.endTime}
                  </td>
                  <td className="px-4 py-3">{slot.duration} mins</td>
                  <td className="px-4 py-3">₹{slot.price}</td>
                  <td
                    className={`px-4 py-3 font-semibold ${
                      slot.status === 'Booked'
                        ? 'text-green-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    {slot.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  <VOFooter />
  </>
  );
};

export default VenueDashboard;