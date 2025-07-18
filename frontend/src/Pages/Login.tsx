import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import GeneralNavbar from "../Components/Navbar/GeneralNavbar";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to log in');
      }

      // Store user data in localStorage for session management
      localStorage.setItem('currentUser', JSON.stringify({
        id: Date.now().toString(),
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      }));

      if (data.user.role === 'user') {
        navigate('/customer/search');
      } else {
        navigate('/venue/dashboard');
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to log in. Please try again.");
    }
  };

  return (
    <>
      <GeneralNavbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100">
        <div className="w-full max-w-md p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <img
                  src="/logo.png"
                  alt="SportSync Logo"
                  className="h-16 w-auto object-contain"
                />
              </div>
              <h2 className="text-2xl font-semibold text-black mb-2">
                Log In to SportSync
              </h2>
              <p className="text-gray-600 text-sm">
                Quick & Simple way to Automate your bookings
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PASSWORD
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                onClick={handleSubmit}
                className="w-full bg-black text-white py-3 rounded-lg font-semibold"
              >
                LOG IN
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;