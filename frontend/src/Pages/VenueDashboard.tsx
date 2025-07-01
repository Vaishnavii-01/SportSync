import React, {useState } from 'react';
import { FaDownload } from 'react-icons/fa';

interface Booking {
  id: string;
  venue: string;
  customer: string;
  datetime: string;
  amount: number;
  status: 'Booked' | 'Pending' | 'Cancelled';
}

const VenueDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalVenues: 6,
    todaysBookings: 100,
    averageRating: 4.6,
    monthlyRevenue: 9750,
  });

  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: '#BK01',
      venue: 'VESIT Turf',
      customer: 'Priya Patel',
      datetime: 'Today, 4 PM',
      amount: 10000,
      status: 'Booked',
    },
    {
      id: '#BK02',
      venue: 'Elite Pool',
      customer: 'John Doe',
      datetime: 'Today, 5 PM',
      amount: 10000,
      status: 'Pending',
    },
    {
      id: '#BK03',
      venue: 'VESIT Turf',
      customer: 'Priya Patel',
      datetime: 'Today, 6 PM',
      amount: 10000,
      status: 'Booked',
    },
  ]);

  return (
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
                <th className="px-4 py-3">Booking ID</th>
                <th className="px-4 py-3">Venue</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="bg-[#fffaf4]">
                  <td className="px-4 py-3 font-medium">{booking.id}</td>
                  <td className="px-4 py-3">{booking.venue}</td>
                  <td className="px-4 py-3">{booking.customer}</td>
                  <td className="px-4 py-3">{booking.datetime}</td>
                  <td className="px-4 py-3">₹{booking.amount}</td>
                  <td
                    className={`px-4 py-3 font-semibold ${
                      booking.status === 'Booked'
                        ? 'text-green-600'
                        : booking.status === 'Pending'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {booking.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VenueDashboard;