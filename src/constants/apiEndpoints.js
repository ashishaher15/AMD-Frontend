// API endpoint configurations
export const API_BASE_URL = "http://localhost:4000";

// Common API endpoints
export const API_ENDPOINTS = {
  // User endpoints
  USER: {
    LOGIN: `${API_BASE_URL}/api/user/login`,
    SIGNUP: `${API_BASE_URL}/api/user/signup`,
    ME: `${API_BASE_URL}/api/user/me`,
    UPDATE: `${API_BASE_URL}/api/user/update`,
    GET_USERS: `${API_BASE_URL}/api/user/get-users`,
    UPDATE_ADDRESS: `${API_BASE_URL}/api/user/update-address`,
  },

  // Doctor endpoints
  DOCTOR: {
    LOGIN: `${API_BASE_URL}/api/doctor/login`,
    SIGNUP: `${API_BASE_URL}/api/doctor/signup`,
    ALL: `${API_BASE_URL}/api/doctor/all`,
    DETAIL: `${API_BASE_URL}/api/doctor`, // Append /:email at usage
    ASSIGN: `${API_BASE_URL}/api/doctor/assign`,
    PATIENTS: `${API_BASE_URL}/api/doctor/patients/emails`,
  },

  // Admin endpoints
  ADMIN: {
    ADD_DOCTOR: `${API_BASE_URL}/api/admin/add-doctor`,
  },

  // Appointment endpoints
  APPOINTMENT: {
    BOOK: `${API_BASE_URL}/api/appointment/book`,
    CHECK: `${API_BASE_URL}/api/appointment/check`,
  },
};
