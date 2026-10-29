import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// =====================================================
// Dashboard
// =====================================================

export const getDashboard = async () => {
  const response = await api.get("/live-water/dashboard");
  return response.data;
};


// =====================================================
// Latest Water Data
// =====================================================

export const getLatestWaterData = async () => {
  const response = await api.get("/live-water/latest");
  return response.data;
};


// =====================================================
// Stations
// =====================================================

export const getStations = async () => {
  const response = await api.get("/live-water/stations");
  return response.data;
};


// =====================================================
// Map Locations
// =====================================================

export const getMapLocations = async () => {
  const response = await api.get("/map/locations");
  return response.data;
};


// =====================================================
// REGISTER WITH EMAIL VERIFICATION
// =====================================================

export const registerUser = async (
  full_name: string,
  email: string,
  phone: string
) => {

  const response = await api.post("/auth/register", {
    full_name,
    email,
    phone,
  });

  return response.data;
};


// =====================================================
// LOGIN WITH EMAIL
// =====================================================

export const loginUser = async (email: string) => {

  const response = await api.post("/auth/login", {
    email,
  });

  const data = response.data;

  if (data.access_token) {
    await AsyncStorage.setItem(
      "access_token",
      data.access_token
    );
  }

  if (data.user) {
    await AsyncStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );
  }

  return data;
};


// =====================================================
// GET STORED USER
// =====================================================

export const getStoredUser = async () => {

  const user = await AsyncStorage.getItem("user");

  if (user) {
    return JSON.parse(user);
  }

  return null;
};


// =====================================================
// GET STORED TOKEN
// =====================================================

export const getStoredToken = async () => {

  return await AsyncStorage.getItem(
    "access_token"
  );
};


// =====================================================
// LOGOUT
// =====================================================

export const logout = async () => {

  await AsyncStorage.removeItem(
    "access_token"
  );

  await AsyncStorage.removeItem(
    "user"
  );
};


// =====================================================
// DEFAULT API
// =====================================================

export default api;