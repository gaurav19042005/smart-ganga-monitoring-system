
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { loginUser } from "../services/api";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await loginUser(email.trim().toLowerCase());
      router.replace("/");
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        "Login failed. Check your email and try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🌊 Smart Ganga</Text>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>
        Sign in with your verified email address
      </Text>

      <Text style={styles.label}>Email Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your registered email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.button, loading && styles.disabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </Pressable>

        <Pressable onPress={() => router.push("/register")}>
        <Text style={styles.link}>
          Don't have an account? Register
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
    marginBottom: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#06445B",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#668095",
    marginTop: 10,
    marginBottom: 32,
  },
  label: {
    fontWeight: "600",
    color: "#173E52",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D5E1E9",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#087E99",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  disabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },
  error: {
    color: "#C62828",
    marginTop: 12,
  },
  link: {
    textAlign: "center",
    color: "#087E99",
    marginTop: 22,
  },
});
