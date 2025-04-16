import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import {
  Award,
  Briefcase,
  DollarSign,
  Info,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import devi from "./devi.png"; // fallback image
import { API_ENDPOINTS } from "../constants/apiEndpoints";

export default function DoctorDropdown() {
  const { user, setUser, token } = useContext(AppContext);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        if (!token) {
          throw new Error("No authentication token found");
        }
        const response = await axios.get(API_ENDPOINTS.DOCTOR.ALL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data && Array.isArray(response.data.doctors)) {
          setDoctors(response.data.doctors);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
        toast.error("Failed to load doctors");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [token]);

  const handleDoctorSelect = async (doctorEmail) => {
    setSelectedDoctor(doctorEmail);

    if (!doctorEmail) {
      toast.warning("Please select a doctor");
      return;
    }

    if (!user || !user.email) {
      toast.error("Please login to assign a doctor");
      navigate("/login");
      return;
    }

    try {
      const selectedDoc = doctors.find((doc) => doc.email === doctorEmail);

      if (!selectedDoc) {
        toast.error("Selected doctor not found");
        return;
      }

      const response = await axios.post(
        API_ENDPOINTS.DOCTOR.ASSIGN,
        {
          userEmail: user.email,
          doctorEmail: doctorEmail,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setUser({
          ...user,
          doctorAssigned: {
            name: selectedDoc.name,
            email: selectedDoc.email,
          },
        });
        toast.success("Doctor assigned successfully!");
      }
    } catch (error) {
      console.error("Error assigning doctor:", error);
      toast.error(error.response?.data?.message || "Failed to assign doctor");
    }
  };

  if (loading) {
    return <div className="text-center mt-8">Loading doctors...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Existing User Information */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Current User Information</h2>
        {user ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">
                <span className="font-medium">Name:</span> {user.name}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Email:</span> {user.email}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Current Doctor:</span>{" "}
                {user.doctorAssigned
                  ? `${user.doctorAssigned.name} (${user.doctorAssigned.email})`
                  : "None"}
              </p>
            </div>
            {/* Add other user info if needed */}
          </div>
        ) : (
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-600">
              User data not available. Please log in.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>

      {/* Custom Dropdown with Doctor Cards for Assignment */}
      {user && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Select Your Doctor (Assign)
          </h2>
          {/* Instead of using a <select>, we use a clickable grid */}
          <div className="flex flex-wrap gap-4 justify-center">
            {doctors.map((doctor, index) => (
              <div
                key={doctor.email || index}
                onClick={() => handleDoctorSelect(doctor.email)}
                className={`bg-white rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-2 transform transition duration-300 cursor-pointer outline outline-2 outline-blue-300 w-[250px] h-[350px] flex-shrink-0 ${
                  selectedDoctor === doctor.email
                    ? "border-2 border-blue-500"
                    : ""
                }`}
              >
                <div className="relative bg-blue-100 h-[200px] rounded-t-2xl flex items-center justify-center overflow-hidden">
                  <img
                    src={
                      doctor.image && doctor.image.base64
                        ? `data:${doctor.image.mimeType};base64,${doctor.image.base64}`
                        : devi
                    }
                    alt={doctor.name}
                    className="w-full h-full object-cover rounded-t-2xl"
                  />
                </div>
                <div className="p-4 text-center">
                  <p
                    className={`font-semibold text-xl flex items-center justify-center ${
                      doctor.available ? "text-green-500" : "text-red-500"
                    } mb-2`}
                  >
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {doctor.available ? "Available" : "Unavailable"}
                  </p>
                  <p className="font-bold text-xl">{doctor.name}</p>
                  <p className="text-lg text-gray-500">{doctor.speciality}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Panel: Clickable List for Viewing Doctor & Scheduling Appointment */}
      {user && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            View Doctor and Schedule Appointment
          </h2>
          {/* Render a grid of doctor cards for navigation */}
          <div className="flex flex-wrap gap-4 justify-center">
            {doctors.map((doctor, index) => (
              <div
                key={doctor.email || index}
                onClick={() => {
                  if (doctor.email) {
                    const url = `/doctor/${doctor.email}`;
                    console.log("Navigating to 1 :", doctor);
                    console.log("Navigating to:", url);
                    navigate(url);
                  } else {
                    console.error("Doctor email is missing!");
                  }
                }}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-2 transform transition duration-300 cursor-pointer outline outline-2 outline-blue-300 w-[250px] h-[350px] flex-shrink-0"
              >
                <div className="relative bg-blue-100 h-[200px] rounded-t-2xl flex items-center justify-center overflow-hidden">
                  <img
                    src={
                      doctor.image && doctor.image.base64
                        ? `data:${doctor.image.mimeType};base64,${doctor.image.base64}`
                        : devi
                    }
                    alt={doctor.name}
                    className="w-full h-full object-cover rounded-t-2xl"
                  />
                </div>
                <div className="p-4 text-center">
                  <p
                    className={`font-semibold text-xl flex items-center justify-center ${
                      doctor.available ? "text-green-500" : "text-red-500"
                    } mb-2`}
                  >
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {doctor.available ? "Available" : "Unavailable"}
                  </p>
                  <p className="font-bold text-xl">{doctor.name}</p>
                  <p className="text-lg text-gray-500">{doctor.speciality}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
