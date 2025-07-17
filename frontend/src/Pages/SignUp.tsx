import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import GeneralNavbar from "../Components/Navbar/GeneralNavbar";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<"customer" | "venueOwner">("customer");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreeToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy");
      return;
    }

    if (!name || !email || !password || !phone) {
      setError("Please fill in all fields");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      const users = JSON.parse(localStorage.getItem('users') || "[]");

      if (users.some((user: any) => user.email === email)) {
        setError("Email already registered");
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        phone,
        role: userType,
        createdAt: new Date().toISOString()
      };

      localStorage.setItem('users', JSON.stringify([...users, newUser]));
      localStorage.setItem('currentUser', JSON.stringify({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }));

      console.log("Current user stored:", localStorage.getItem('currentUser'));
      console.log("All users:", localStorage.getItem('users'));

      navigate(userType === 'customer' ? '/customer/dashboard' : '/venue/dashboard');
    } catch (err) {
      console.error("Signup error:", err);
      setError("Failed to create account. Please try again.");
    }
  };

  return (
    <>
      <GeneralNavbar />
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, #a8edea 0%, #fed6e3 25%, #ffecd2 50%, #fcb69f 75%, #667eea 100%)",
        }}
      >
        <div className="w-full max-w-md">
          <br />
          <br />
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
                Sign up to SportSync
              </h2>
              <p className="text-gray-600 text-sm">
                Quick & Simple way to Automate your bookings
              </p>
            </div>

            <div className="flex mb-6 rounded-lg bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setUserType('customer')}
                className={`flex-1 py-2 rounded-md text-sm font-medium ${
                  userType === 'customer' 
                    ? 'bg-white shadow-sm text-black' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                I'm a Customer
              </button>
              <button
                type="button"
                onClick={() => setUserType('venueOwner')}
                className={`flex-1 py-2 rounded-md text-sm font-medium ${
                  userType === 'venueOwner' 
                    ? 'bg-white shadow-sm text-black' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                I'm a Venue Owner
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  FULL NAME
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  EMAIL ADDRESS
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PASSWORD
                </label>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PHONE NUMBER
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 123-456-7890"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                  required
                />
                <span className="ml-3 text-sm text-gray-700">
                  I agree to the{" "}
                  <button className="text-blue-600 hover:text-blue-800 underline">
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button className="text-blue-600 hover:text-blue-800 underline">
                    Privacy Policy
                  </button>
                </span>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-200"
              >
                CREATE {userType.toUpperCase()} ACCOUNT
              </button>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <a href="/login" className="text-blue-600 hover:text-blue-800 font-semibold">
                    Log In
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;