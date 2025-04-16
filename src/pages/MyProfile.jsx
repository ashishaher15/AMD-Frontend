import React, { useState, useEffect } from "react";
import axios from "axios";
import sha256 from "sha256";
import Sidebar from "../components/Sidebar";
import { Eye, EyeOff } from "lucide-react"; // For password visibility toggle
import jsPDF from "jspdf";
import "jspdf-autotable";
import { ethers } from "ethers";
import { contractABI } from "./constants"; // Ensure your contractABI is correctly imported
import Modal from "react-modal";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

// Set Modal's root element for accessibility
Modal.setAppElement("#root");

// Hardcoded values for local Hardhat (DO NOT use in production)
const PRIVATE_KEY =
  "0x8166f546bab6da521a8369cab06c5d2b9e46670292d85c875ee9ec20e84ffb61";
const PROVIDER_URL = "http://127.0.0.1:8545";
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Your deployed contract address

const MyProfile = () => {
  // Local state to store user data fetched from backend
  const [user, setUser] = useState(null);
  // Local state for form fields; will be initialized once user is loaded
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    gender: "",
    dob: "",
    phone: "",
    bloodGroup: "",
    age: "",
    emergencyContact: "",
    allergies: "",
    vaccinationHistory: "",
    healthInsurancePolicy: "",
    doctorAssigned: "",
    documents: "",
  });
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [prescriptionImage, setPrescriptionImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfRecord, setPdfRecord] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // For blockchain (if used later)
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);

  // Fetch user data from backend using token from localStorage
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        if (!token) {
          setError("User token not found");
          setLoading(false);
          return;
        }
        const response = await axios.get("http://localhost:4000/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setUser(response.data.user);
          console.log("Fetched user:", response.data.user);
          console.log("User documents:", response.data.user.documents);
          console.log("User documents.pdf:", response.data.user.documents?.pdf);
          // Populate formData with fetched data
          setFormData({
            email: response.data.user.email || "",
            password: response.data.user.password || "",
            gender: response.data.user.gender || "",
            dob: response.data.user.dob || "",
            phone: response.data.user.phone || "",
            bloodGroup: response.data.user.bloodGroup || "",
            age: response.data.user.age || "",
            emergencyContact: response.data.user.emergencyContact || "",
            allergies: response.data.user.allergies || "",
            vaccinationHistory: response.data.user.vaccinationHistory || "",
            healthInsurancePolicy:
              response.data.user.healthInsurancePolicy || "",
            doctorAssigned: response.data.user.doctorAssigned || "",
            documents: response.data.user.documents?.pdf || "",
          });
          // Convert the PDF from base64 to blob URL if it exists.
          if (
            response.data.user.documents &&
            response.data.user.documents.pdf
          ) {
            const base64Data = response.data.user.documents.pdf;
            // Decode base64 to binary string
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: "application/pdf" });
            const pdfBlobUrl = URL.createObjectURL(blob);
            setPdfUrl(pdfBlobUrl);
          }
        } else {
          setError("Failed to load user data.");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Error fetching user data");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // Generate PDF from user data
  const generatePDF = (data) => {
    const doc = new jsPDF();
    doc.text("User Profile", 14, 15);

    const tableColumn = ["Field", "Value"];
    const tableRows = [];

    Object.entries(data).forEach(([key, value]) => {
      tableRows.push([key, value]);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    const pdfBlob = doc.output("blob");
    const blobUrl = URL.createObjectURL(pdfBlob);
    const pdfArrayBuffer = doc.output("arraybuffer");

    return { blobUrl, pdfArrayBuffer };
  };

  // Profile update submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPdfUrl(null);
    setPdfRecord(null);

    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      submitData.append(key, formData[key]);
    });
    if (prescriptionImage) {
      submitData.append("prescriptionImage", prescriptionImage);
    }

    try {
      const response = await axios.put(API_ENDPOINTS.USER.UPDATE, submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.success) {
        setUser(response.data.user);
        alert("Profile updated successfully");
        const { blobUrl, pdfArrayBuffer } = generatePDF(response.data.user);
        setPdfUrl(blobUrl);
        await handleStorePdf(pdfArrayBuffer);
        setIsEditing(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  // Function to generate SHA‑256 hash and store PDF in MongoDB
  const handleStorePdf = async (pdfArrayBuffer) => {
    try {
      console.log("handleStorePdf: Started processing PDF");
      const pdfHash = sha256(pdfArrayBuffer);
      console.log("handleStorePdf: Computed PDF hash:", pdfHash);
      const pdfBlob = new Blob([pdfArrayBuffer], { type: "application/pdf" });
      const pdfFile = new File([pdfBlob], "profile.pdf", {
        type: "application/pdf",
      });
      console.log("handleStorePdf: Created PDF file:", pdfFile);
      const pdfFormData = new FormData();
      pdfFormData.append("pdf", pdfFile);
      console.log("handleStorePdf: FormData prepared. Keys:", [
        ...pdfFormData.keys(),
      ]);
      const uploadUrl = "http://localhost:4000/api/user/upload-pdf";
      console.log("handleStorePdf: Sending PUT request to:", uploadUrl);
      const response = await axios.put(uploadUrl, pdfFormData);
      console.log("handleStorePdf: Received response:", response);
      console.log("handleStorePdf: PDF stored in MongoDB successfully!");
    } catch (err) {
      console.error("handleStorePdf: Error storing PDF in MongoDB:", err);
      if (err.response) {
        console.error(
          "handleStorePdf: Error response data:",
          err.response.data
        );
        console.error(
          "handleStorePdf: Error response status:",
          err.response.status
        );
      }
    }
  };

  // Toggle to enter edit mode
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Cancel edit and revert formData to original user data
  const handleCancelEdit = () => {
    setFormData({
      email: user?.email || "",
      password: user?.password || "",
      gender: user?.gender || "",
      dob: user?.dob || "",
      phone: user?.phone || "",
      bloodGroup: user?.bloodGroup || "",
      age: user?.age || "",
      emergencyContact: user?.emergencyContact || "",
      allergies: user?.allergies || "",
      vaccinationHistory: user?.vaccinationHistory || "",
      healthInsurancePolicy: user?.healthInsurancePolicy || "",
      doctorAssigned: user?.doctorAssigned || "",
      documents: user?.documents || "",
    });
    setPrescriptionImage(null);
    setIsEditing(false);
  };

  // Render display view (read-only)
  const renderDisplayView = () => (
    <div className="space-y-4">
      <p>
        <span className="font-medium">Email:</span> {user?.email}
      </p>
      <p>
        <span className="font-medium">Password:</span> {user?.password}
      </p>
      <p>
        <span className="font-medium">Gender:</span> {user?.gender}
      </p>
      <p>
        <span className="font-medium">DOB:</span> {user?.dob}
      </p>
      <p>
        <span className="font-medium">Phone:</span> {user?.phone}
      </p>
      <p>
        <span className="font-medium">Blood Group:</span> {user?.bloodGroup}
      </p>
      <p>
        <span className="font-medium">Age:</span> {user?.age}
      </p>
      <p>
        <span className="font-medium">Emergency Contact:</span>{" "}
        {user?.emergencyContact}
      </p>
      <p>
        <span className="font-medium">Allergies:</span> {user?.allergies}
      </p>
      <p>
        <span className="font-medium">Vaccination History:</span>{" "}
        {user?.vaccinationHistory}
      </p>
      {/* Button to open PDF preview modal */}
      {pdfUrl && (
        <button
          onClick={() => setIsPdfOpen(true)}
          className="mt-4 bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
        >
          Preview PDF
        </button>
      )}
      <button
        onClick={handleEditClick}
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Edit Profile
      </button>
    </div>
  );

  // Render editable form view
  const renderEditView = () => (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:bg-gray-50"
            autoComplete="email"
            required
          />
        </div>
        {/* Password */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:bg-gray-50"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-500" />
              ) : (
                <Eye className="h-5 w-5 text-gray-500" />
              )}
            </button>
          </div>
        </div>
        {/* Gender */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Gender
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={(e) =>
              setFormData({ ...formData, gender: e.target.value })
            }
            className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:bg-gray-50"
            required
          >
            <option value="" disabled>
              Select your gender
            </option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Others">Others</option>
          </select>
        </div>
        {/* Phone */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:bg-gray-50"
            placeholder="Enter your phone number"
            autoComplete="tel"
            required
          />
        </div>
        {/* Blood Group */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Blood Group
          </label>
          <input
            type="text"
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={(e) =>
              setFormData({ ...formData, bloodGroup: e.target.value })
            }
            className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:bg-gray-50"
            placeholder="Enter your blood group"
            autoComplete="off"
            required
          />
        </div>
        {/* Age */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Age
          </label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:bg-gray-50"
            placeholder="Enter your age"
            autoComplete="off"
            required
          />
        </div>
        {/* Additional Fields */}
        {Object.keys(formData)
          .filter(
            (field) =>
              ![
                "email",
                "password",
                "gender",
                "phone",
                "bloodGroup",
                "age",
                "doctorAssigned",
              ].includes(field)
          )
          .map((field) => (
            <div key={field} className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2 capitalize">
                {field.replace(/([A-Z])/g, " $1")}
              </label>
              <input
                type={field === "dob" ? "date" : "text"}
                name={field}
                value={formData[field]}
                onChange={(e) =>
                  setFormData({ ...formData, [field]: e.target.value })
                }
                className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:bg-gray-50"
                autoComplete="off"
                required
              />
            </div>
          ))}
      </div>
      {/* Prescription Image Upload */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Prescription Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPrescriptionImage(e.target.files[0])}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:bg-gray-50"
        />
      </div>
      {/* Save and Cancel Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Updating..." : "Save"}
        </button>
        <button
          type="button"
          onClick={handleCancelEdit}
          className="w-full bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none"
        >
          Cancel
        </button>
      </div>
    </form>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            My Profile
          </h2>
          {/* Toggle between display and edit mode */}
          {isEditing ? renderEditView() : renderDisplayView()}
          {/* PDF Download Link (if generated) */}
          {pdfUrl && (
            <div className="mt-4 text-center space-y-4">
              <a
                href={pdfUrl}
                download="profile.pdf"
                className="inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Download PDF
              </a>
            </div>
          )}
        </div>
      </div>
      {/* Modal for PDF Preview using an iframe */}
      <Modal
        isOpen={isPdfOpen}
        onRequestClose={() => setIsPdfOpen(false)}
        style={{
          content: {
            width: "80%",
            height: "80%",
            margin: "auto",
            overflow: "hidden",
          },
        }}
      >
        <div className="flex justify-end">
          <button
            onClick={() => setIsPdfOpen(false)}
            className="text-red-500 font-bold"
          >
            Close
          </button>
        </div>
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            title="PDF Preview"
            width="100%"
            height="100%"
            style={{ border: "none" }}
          />
        ) : (
          <p>No PDF available</p>
        )}
      </Modal>
    </div>
  );
};

export default MyProfile;
