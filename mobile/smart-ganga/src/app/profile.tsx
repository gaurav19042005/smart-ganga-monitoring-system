
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { getProfile, logout, getStoredUser } from "../services/api";

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // Try fetching the actual profile from the backend.
      const profile = await getProfile();
      setUser(profile);
    } catch (error) {
      // Fall back to locally stored details if available.
      const storedUser = await getStoredUser();
      setUser(storedUser);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#087E99" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>You're not logged in</Text>
        <Text style={styles.subtitle}>
          Log in to view your Smart Ganga profile.
        </Text>
        <Pressable
          style={styles.button}
          onPress={() => router.replace("/login")}
        >
          <Text style={styles.buttonText}>Go to Login</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>
      <Text style={styles.subtitle}>Smart Ganga Monitoring System</Text>

      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {user.full_name?.charAt(0)?.toUpperCase() || "U"}
        </Text>
      </View>

      <Text style={styles.name}>{user.full_name || "User"}</Text>
      <Text style={styles.role}>{user.role || "Public User"}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Full Name</Text>
        <Text style={styles.value}>{user.full_name || "Not available"}</Text>

        <View style={styles.divider} />

        <Text style={styles.label}>Email Address</Text>
        <Text style={styles.value}>{user.email || "Not available"}</Text>

        <View style={styles.divider} />

        <Text style={styles.label}>Mobile Number</Text>
        <Text style={styles.value}>{user.phone || "Not available"}</Text>

        <View style={styles.divider} />

        <Text style={styles.label}>Account Status</Text>
        <Text style={styles.verified}>
          {user.email_verified === true
            ? "Email verified"
            : user.email_verified === false
            ? "Email not verified"
            : "Verification status unavailable"}
        </Text>
      </View>

      <Pressable style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F8FC",
    padding: 22,
    alignItems: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F3F8FC",
  },
  loadingText: {
    marginTop: 12,
    color: "#668095",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#06445B",
    marginTop: 20,
    textAlign: "center",
  },
  subtitle: {
    color: "#668095",
    marginTop: 6,
    textAlign: "center",
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#087E99",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "bold",
  },
  name: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#123B50",
    marginTop: 12,
  },
  role: {
    color: "#668095",
    marginTop: 4,
    textTransform: "capitalize",
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginTop: 26,
  },
  label: {
    color: "#71869A",
    fontSize: 13,
    marginBottom: 5,
  },
  value: {
    color: "#173E52",
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#E6EDF2",
    marginVertical: 15,
  },
  verified: {
    color: "#16834A",
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#D94343",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
