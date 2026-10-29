
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { registerUser } from "../services/api";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setMessage("");
    setError("");

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!/^[0-9+\-\s]{10,16}$/.test(phone.trim())) {
      setError("Please enter a valid mobile number.");
      return;
    }

    setLoading(true);

    try {
      const result = await registerUser(
        fullName.trim(),
        email.trim().toLowerCase(),
        phone.trim()
      );

      setMessage(
        result.message ||
          "Verification email sent. Please check your inbox."
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Registration failed. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🌊 Smart Ganga</Text>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>
        Join the Smart Ganga Monitoring System
      </Text>

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your full name"
        value={fullName}
        onChangeText={setFullName}
        autoCapitalize="words"
      />

      <Text style={styles.label}>Email Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />

      <Text style={styles.label}>Mobile Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your mobile number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {message ? (
        <View style={styles.successBox}>
          <Text style={styles.success}>{message}</Text>
          <Text style={styles.hint}>
            Open the verification link in your email. After verification,
            return here and log in.
          </Text>
        </View>
      ) : null}

      <Pressable
        style={[styles.button, loading && styles.disabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Create Account</Text>
        )}
      </Pressable>

      <Pressable onPress={() => router.replace("/login")}>
        <Text style={styles.link}>
          Already have an account? Login
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 28,
    backgroundColor: "#F3F8FC",
  },
  logo: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#087E99",
    textAlign: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#06445B",
    textAlign: "center",
  },
  subtitle: {
    color: "#668095",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 28,
  },
  label: {
    color: "#173E52",
    fontWeight: "600",
    marginBottom: 7,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D5E1E9",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#087E99",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 22,
  },
  disabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },
  link: {
    color: "#087E99",
    textAlign: "center",
    marginTop: 22,
  },
  error: {
    color: "#C62828",
    marginTop: 12,
  },
  successBox: {
    backgroundColor: "#E5F6EA",
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
  },
  success: {
    color: "#176B38",
    fontWeight: "600",
  },
  hint: {
    color: "#315D43",
    marginTop: 8,
    lineHeight: 20,
  },
});
