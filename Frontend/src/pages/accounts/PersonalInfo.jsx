import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { applicationAPI } from "../../services/api";

const PersonalInfo = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Personal Information
    fullName: "",
    dob: "",
    gender: "",
    mobile: "",
    email: "",

    // Address Information
    address: "",
    city: "",
    state: "",
    pincode: "",

    // Employment Information
    occupation: "",
    employerName: "",
    annualIncome: "",
    sourceOfFunds: "",

    // Marital Status
    maritalStatus: "",

    // Emergency Contact
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
  });

  const [errors, setErrors] = useState({});
  const [accountType, setAccountType] = useState("");

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.fullName || "",
        email: user.email || "",
        mobile: user.mobile || user.phone || "",
      }));
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};

    // Personal Information
    if (!formData.fullName.trim() || formData.fullName.length < 2)
      newErrors.fullName = "Full name must be at least 2 characters";

    if (!formData.dob) newErrors.dob = "Date of birth is required";

    // Validate age
    if (formData.dob) {
      const dob = new Date(formData.dob);
      const today = new Date();

      let age = today.getFullYear() - dob.getFullYear(); // ✅ let, not const
      const monthDiff = today.getMonth() - dob.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < dob.getDate())
      ) {
        age--;
      }

      if (age < 18) {
        newErrors.dob = "You must be at least 18 years old";
      }
    }

    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.mobile.trim()) newErrors.mobile = "Mobile number is required";
    else if (!/^[6-9]\d{9}$/.test(formData.mobile))
      newErrors.mobile =
        "Invalid mobile number (must start with 6-9 and be 10 digits)";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email";

    // Address Information
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(formData.pincode))
      newErrors.pincode = "Invalid pincode (must be 6 digits)";

    // Employment Information
    if (!formData.occupation.trim())
      newErrors.occupation = "Occupation is required";
    if (!formData.annualIncome)
      newErrors.annualIncome = "Annual income is required";
    if (!formData.maritalStatus)
      newErrors.maritalStatus = "Marital status is required";

    // Emergency Contact
    if (!formData.emergencyContactName.trim())
      newErrors.emergencyContactName = "Emergency contact name is required";
    if (!formData.emergencyContactPhone.trim())
      newErrors.emergencyContactPhone = "Emergency contact phone is required";
    else if (!/^[6-9]\d{9}$/.test(formData.emergencyContactPhone))
      newErrors.emergencyContactPhone = "Invalid phone number";
    if (!formData.emergencyContactRelationship.trim())
      newErrors.emergencyContactRelationship = "Relationship is required";

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for mobile numbers
    if (name === "mobile" || name === "emergencyContactPhone") {
      const numbersOnly = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({
        ...prev,
        [name]: numbersOnly,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    setApiError("");

    try {
      // Prepare data exactly as backend expects
      const dataToSend = {
        accountType,
        fullName: formData.fullName.trim(),
        dob: formData.dob,
        gender: formData.gender,
        mobile: formData.mobile,
        email: formData.email.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode,
        occupation: formData.occupation,
        employerName: formData.employerName || "",
        annualIncome: formData.annualIncome,
        sourceOfFunds: formData.sourceOfFunds || "",
        maritalStatus: formData.maritalStatus,
        emergencyContactName: formData.emergencyContactName.trim(),
        emergencyContactPhone: formData.emergencyContactPhone,
        emergencyContactRelationship: formData.emergencyContactRelationship,
      };

      console.log("Sending personal info:", dataToSend);

      const response = await applicationAPI.updatePersonalInfo(
        applicationId,
        dataToSend
      );

      if (response.data.success) {
        navigate(`/accounts/open/${applicationId}/identity-info`);
      }
    } catch (err) {
      console.error("Failed to update personal info:", err);
      console.error("Error details:", err.response?.data);

      if (err.response?.data?.errors) {
        setApiError(err.response.data.errors.join(", "));
      } else {
        setApiError(
          err.response?.data?.message || "Failed to update information"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await applicationAPI.getApplicationById(applicationId);
        if (res.data.success) {
          setAccountType(res.data.application.accountType);
        }
      } catch (err) {
        console.error("Failed to fetch application", err);
      }
    };

    fetchApplication();
  }, [applicationId]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="h-1 w-24 bg-green-600"></div>
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold">2</span>
              </div>
              <div className="h-1 w-24 bg-gray-300"></div>
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 font-bold">3</span>
              </div>
              <div className="h-1 w-24 bg-gray-300"></div>
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 font-bold">4</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span className="text-green-600 font-medium">Account Type</span>
            <span className="text-blue-600 font-medium">Personal Info</span>
            <span>Identity Info</span>
            <span>Verification</span>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Personal Information
              </h1>
              <p className="text-gray-600">
                Please provide your personal details for account opening. All
                fields are required unless marked optional.
              </p>
            </div>

            {apiError && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{apiError}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Section 1: Basic Personal Information */}
              <div className="mb-10">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                  Basic Information
                </h2>
                {/* Account Type (Auto-filled) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Type
                  </label>
                  <input
                    type="text"
                    value={
                      accountType === "saving"
                        ? "Savings Account"
                        : accountType === "current"
                        ? "Current Account"
                        : ""
                    }
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.fullName ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your full name as per ID"
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      max={new Date().toISOString().split("T")[0]}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.dob ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.dob && (
                      <p className="mt-1 text-sm text-red-600">{errors.dob}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.gender ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">
                        Prefer not to say
                      </option>
                    </select>
                    {errors.gender && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.gender}
                      </p>
                    )}
                  </div>

                  {/* Marital Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marital Status *
                    </label>
                    <select
                      name="maritalStatus"
                      value={formData.maritalStatus}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.maritalStatus
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Marital Status</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                      <option value="widowed">Widowed</option>
                    </select>
                    {errors.maritalStatus && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.maritalStatus}
                      </p>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.mobile ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="10-digit mobile number"
                      maxLength="10"
                    />
                    {errors.mobile && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.mobile}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="your@email.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Address Information */}
              <div className="mb-10">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                  Address Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Complete Address *
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="3"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.address ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="House no, Building, Street, Area"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.city ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter city"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.state ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter state"
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.state}
                      </p>
                    )}
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.pincode ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="6-digit pincode"
                      maxLength="6"
                    />
                    {errors.pincode && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.pincode}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Employment Information */}
              <div className="mb-10">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                  Employment & Income Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Occupation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Occupation *
                    </label>
                    <select
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.occupation ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Occupation</option>
                      <option value="student">Student</option>
                      <option value="employed">Employed (Salaried)</option>
                      <option value="self-employed">Self Employed</option>
                      <option value="business">Business</option>
                      <option value="homemaker">Homemaker</option>
                      <option value="retired">Retired</option>
                      <option value="unemployed">Unemployed</option>
                    </select>
                    {errors.occupation && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.occupation}
                      </p>
                    )}
                  </div>

                  {/* Employer Name (conditional) */}
                  {formData.occupation === "employed" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employer Name (Optional)
                      </label>
                      <input
                        type="text"
                        name="employerName"
                        value={formData.employerName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter employer name"
                      />
                    </div>
                  )}

                  {/* Annual Income */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Annual Income (₹) *
                    </label>
                    <select
                      name="annualIncome"
                      value={formData.annualIncome}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.annualIncome
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Income Range</option>
                      <option value="0-250000">₹0 - ₹2,50,000</option>
                      <option value="250001-500000">
                        ₹2,50,001 - ₹5,00,000
                      </option>
                      <option value="500001-1000000">
                        ₹5,00,001 - ₹10,00,000
                      </option>
                      <option value="1000001-5000000">
                        ₹10,00,001 - ₹50,00,000
                      </option>
                      <option value="5000000+">Above ₹50,00,000</option>
                    </select>
                    {errors.annualIncome && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.annualIncome}
                      </p>
                    )}
                  </div>

                  {/* Source of Funds */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Source of Funds (Optional)
                    </label>
                    <select
                      name="sourceOfFunds"
                      value={formData.sourceOfFunds}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Source</option>
                      <option value="salary">Salary</option>
                      <option value="business">Business Income</option>
                      <option value="investments">Investments</option>
                      <option value="inheritance">Inheritance</option>
                      <option value="savings">Savings</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 4: Emergency Contact */}
              <div className="mb-10">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                  Emergency Contact
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Emergency Contact Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact Name *
                    </label>
                    <input
                      type="text"
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.emergencyContactName
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Full name of emergency contact"
                    />
                    {errors.emergencyContactName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.emergencyContactName}
                      </p>
                    )}
                  </div>

                  {/* Emergency Contact Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact Phone *
                    </label>
                    <input
                      type="tel"
                      name="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.emergencyContactPhone
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="10-digit mobile number"
                      maxLength="10"
                    />
                    {errors.emergencyContactPhone && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.emergencyContactPhone}
                      </p>
                    )}
                  </div>

                  {/* Emergency Contact Relationship */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relationship *
                    </label>
                    <select
                      name="emergencyContactRelationship"
                      value={formData.emergencyContactRelationship}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.emergencyContactRelationship
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Relationship</option>
                      <option value="spouse">Spouse</option>
                      <option value="parent">Parent</option>
                      <option value="sibling">Sibling</option>
                      <option value="child">Child</option>
                      <option value="friend">Friend</option>
                      <option value="relative">Relative</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.emergencyContactRelationship && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.emergencyContactRelationship}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-3 px-6 rounded-md font-medium ${
                    loading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white transition-colors`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    "Continue to Identity Info"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/accounts/open")}
                  className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
