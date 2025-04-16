import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

const Dashboard = () => {
  const { user, isDoctor, setUser, setToken, token } = useContext(AppContext);
  const [patientEmails, setPatientEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleTokenExpiration = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // setToken(null);
    setUser(null);
    navigate("/login");
    toast.error("Session expired. Please login again.");
  };

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        // Only fetch if user is a doctor
        if (isDoctor && user) {
          console.log("Fetching patient emails for doctor:", user.email);

          const storedToken = localStorage.getItem("token") || token;
          if (!storedToken) {
            throw new Error("No token found");
          }

          const res = await axios.get(API_ENDPOINTS.DOCTOR.PATIENTS, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });

          console.log("API Response:", res.data);

          if (res.data.success) {
            setPatientEmails(res.data.patients);
          }
        }
      } catch (error) {
        console.error("Error fetching patient data:", error);
        if (error.response?.status === 401) {
          handleTokenExpiration();
        } else {
          toast.error("Failed to fetch patient data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [user, isDoctor, token]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center">Please login to view dashboard</div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">
        {isDoctor ? "Doctor Dashboard" : "Patient Dashboard"}
      </h2>

      {isDoctor ? (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Doctor Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium">
                  Name: <span className="font-normal">{user.name}</span>
                </p>
                <p className="font-medium">
                  Email: <span className="font-normal">{user.email}</span>
                </p>
                <p className="font-medium">
                  Speciality:{" "}
                  <span className="font-normal">{user.speciality}</span>
                </p>
                <p className="font-medium">
                  Experience:{" "}
                  <span className="font-normal">{user.experience}</span>
                </p>
              </div>
              <div>
                <p className="font-medium">
                  Status:
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-sm ${
                      user.available
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.available ? "Available" : "Not Available"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">
              Patient List ({patientEmails.length})
            </h3>
            {patientEmails.length > 0 ? (
              <div className="space-y-3">
                {patientEmails.map((patient, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{patient.email}</p>
                      <p className="text-sm text-gray-500">
                        Assigned:{" "}
                        {new Date(patient.assignedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        patient.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {patient.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No patients assigned yet
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Patient Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <p className="font-medium">
              Name: <span className="font-normal">{user.name}</span>
            </p>
            <p className="font-medium">
              Email: <span className="font-normal">{user.email}</span>
            </p>
            <p className="font-medium">
              Assigned Doctor:{" "}
              <span className="font-normal">
                {user.doctorAssigned?.name || "Not assigned"}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
