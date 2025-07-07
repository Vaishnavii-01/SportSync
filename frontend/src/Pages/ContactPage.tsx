import React, { useState } from "react";
import { FaPhoneAlt, FaEnvelope, FaClock, FaChevronDown } from "react-icons/fa";
import GeneralNavbar from "../Components/Navbar/GeneralNavbar";

const ContactPage: React.FC = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqs = [
    {
      question: "How to book a Venue?",
      answer:
        "To book a venue, explore available venues, select your preferred time slot, and proceed to checkout.",
    },
    {
      question: "How do I cancel a booking?",
      answer:
        "Log in to your account, navigate to ‘My Bookings’, select the booking you want to cancel, and click on 'Cancel'.",
    },
    {
      question: "Can I book multiple slots at once?",
      answer:
        "Yes, you can select multiple slots before proceeding to payment. Make sure all slots are available before checkout.",
    },
    {
      question: "How to request a refund?",
      answer:
        "If eligible, refunds can be requested through the booking details page. Our support team will process it within 5–7 working days.",
    },
  ];

  return (
    <>
      <GeneralNavbar />
      <div className="bg-[#FFFEF8] min-h-screen py-12 px-4 sm:px-16">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h1 className="text-4xl font-bold mb-4 text-gray-900">
              Need Help? <br /> We're Here for You!
            </h1>
            <p className="text-gray-700 text-lg mb-8">
              Contact us for support, questions, or feedback.
            </p>

            <ul className="space-y-4 text-gray-800 text-base">
              <li className="flex items-center gap-2">
                <FaPhoneAlt />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <FaEnvelope />
                <span>support@sportsync.in</span>
              </li>
              <li className="flex items-center gap-2">
                <FaClock />
                <span>Mon–Fri : 9AM–6PM</span>
              </li>
            </ul>

            <h2 className="mt-12 mb-4 text-2xl font-semibold text-gray-900">FAQs</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index}>
                  <button
                    onClick={() =>
                      setExpandedFAQ(expandedFAQ === index ? null : index)
                    }
                    className="w-full flex justify-between items-center bg-[#EDEAE4] text-left px-5 py-3 rounded-lg font-medium text-gray-900 hover:bg-[#ecdfc1]"
                  >
                    {faq.question}
                    <FaChevronDown
                      className={`transition-transform duration-200 ${
                        expandedFAQ === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedFAQ === index && (
                    <div className="bg-white px-5 py-3 text-gray-700 text-sm rounded-b-lg border border-t-0 border-gray-300">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-xl p-8">
            <h3 className="text-2xl font-semibold mb-2 text-gray-900">Contact Us</h3>
            <p className="text-gray-600 mb-6">Let’s get in touch!</p>

            <form className="space-y-4">
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                name="name"
                placeholder="Name"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <textarea
                name="message"
                placeholder="Content"
                rows={4}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              ></textarea>

              <button
                type="submit"
                className="w-full bg-black text-white font-semibold py-2 rounded-md hover:opacity-90"
              >
                Submit
              </button>
            </form>

            <div className="mt-6">
              <iframe
                title="Google Map"
                src="https://maps.google.com/maps?q=CIBA%2C6th%20Floor%2CAgnel%20Technical%20Complex%2CSector%209A%2CVashi%2CNavi%20Mumbai%2C%20Maharashtra%20400703&t=m&z=15&output=embed"
                width="100%"
                height="250"
                allowFullScreen
                loading="lazy"
                className="rounded-md border-0"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;