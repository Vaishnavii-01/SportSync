import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import GeneralNavbar from "../Components/Navbar/GeneralNavbar";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      console.log("Response:", response, "Data:", data); // Debugging log
      if (response.ok) {
        console.log("Login successful:", data);
        // Redirect or update state on success (e.g., set user session)
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Fetch error:", err); // Debugging log
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <>
      <GeneralNavbar />
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div className="w-full max-w-md">
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-2">
                  EMAIL ADDRESS
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="johndoe@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              <div>
                <div className="block text-sm font-medium text-gray-700 mb-2">
                  PASSWORD
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Remember Me
                  </span>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                  Forgot Password?
                </button>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-200"
              >
                PROCEED
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
