import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getDashboard } from "../services/api";

type DashboardData = {
  status: string;
  totalStations: number;
  waterQuality: {
    good: number;
    moderate: number;
    poor: number;
  };
  averages: {
    pH: number;
    dissolvedOxygen: number;
    BOD: number;
  };
};

export default function HomeScreen() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setError("");

      const response = await getDashboard();

      setDashboard(response);
    } catch (err) {
      console.error("Dashboard API error:", err);
      setError("Unable to load live water quality data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    // Refresh every 15 seconds
    const interval = setInterval(() => {
      loadDashboard();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.logo}>🌊</Text>

        <Text style={styles.loadingTitle}>
          Smart Ganga Monitoring
        </Text>

        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading live water quality...
        </Text>
      </View>
    );
  }

  // Error state
  if (error || !dashboard) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>

        <Text style={styles.errorTitle}>
          Unable to Load Dashboard
        </Text>

        <Text style={styles.errorText}>
          {error || "No dashboard data available."}
        </Text>

        <Text
          style={styles.retryText}
          onPress={loadDashboard}
        >
          Tap to Retry
        </Text>
      </View>
    );
  }

  // Dashboard
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>
            Smart Ganga
          </Text>

          <Text style={styles.subtitle}>
            Live River Monitoring
          </Text>
        </View>

        <Text style={styles.headerIcon}>🌊</Text>
      </View>

      {/* Hero */}
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>
          LIVE MONITORING
        </Text>

        <Text style={styles.heroTitle}>
          Ganga Water Quality
        </Text>

        <Text style={styles.heroText}>
          Monitoring {dashboard.totalStations} stations
          across the river network.
        </Text>
      </View>

      {/* Total Stations */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Monitoring Stations
        </Text>

        <Text style={styles.stationNumber}>
          {dashboard.totalStations}
        </Text>

        <Text style={styles.cardSubtitle}>
          Active monitoring stations
        </Text>
      </View>

      {/* Good / Moderate / Poor */}
      <View style={styles.row}>
        <View style={[styles.statusCard, styles.goodCard]}>
          <Text style={styles.statusIcon}>🟢</Text>

          <Text style={styles.statusNumber}>
            {dashboard.waterQuality.good}
          </Text>

          <Text style={styles.statusLabel}>
            Good
          </Text>
        </View>

        <View style={[styles.statusCard, styles.moderateCard]}>
          <Text style={styles.statusIcon}>🟡</Text>

          <Text style={styles.statusNumber}>
            {dashboard.waterQuality.moderate}
          </Text>

          <Text style={styles.statusLabel}>
            Moderate
          </Text>
        </View>

        <View style={[styles.statusCard, styles.poorCard]}>
          <Text style={styles.statusIcon}>🔴</Text>

          <Text style={styles.statusNumber}>
            {dashboard.waterQuality.poor}
          </Text>

          <Text style={styles.statusLabel}>
            Poor
          </Text>
        </View>
      </View>

      {/* Average Water Quality */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Average Water Quality
        </Text>

        <View style={styles.metricRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>
              pH
            </Text>

            <Text style={styles.metricValue}>
              {Number(dashboard.averages.pH).toFixed(2)}
            </Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>
              Dissolved O₂
            </Text>

            <Text style={styles.metricValue}>
              {Number(
                dashboard.averages.dissolvedOxygen
              ).toFixed(2)}
            </Text>

            <Text style={styles.metricUnit}>
              mg/L
            </Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>
              BOD
            </Text>

            <Text style={styles.metricValue}>
              {Number(dashboard.averages.BOD).toFixed(2)}
            </Text>

            <Text style={styles.metricUnit}>
              mg/L
            </Text>
          </View>
        </View>
      </View>

      {/* Digital Twin */}
      <View style={styles.footerCard}>
        <Text style={styles.footerTitle}>
          🤖 AI Digital Twin
        </Text>

        <Text style={styles.footerText}>
          Live water-quality values are generated from
          historical monitoring data and updated
          automatically by the backend.
        </Text>

        <Text style={styles.refreshText}>
          Dashboard refresh: Every 15 seconds
        </Text>
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F8FC",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#F3F8FC",
  },

  logo: {
    fontSize: 64,
    marginBottom: 15,
  },

  loadingTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 25,
    textAlign: "center",
  },

  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#52606D",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  appTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0B3954",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 15,
    color: "#607D8B",
  },

  headerIcon: {
    fontSize: 42,
  },

  heroCard: {
    backgroundColor: "#0E7490",
    borderRadius: 22,
    padding: 24,
    marginBottom: 16,
  },

  heroLabel: {
    color: "#BFEAF5",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 8,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "800",
  },

  heroText: {
    color: "#E0F2F7",
    fontSize: 15,
    marginTop: 8,
    lineHeight: 22,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#17324D",
  },

  cardSubtitle: {
    color: "#718096",
    marginTop: 4,
  },

  stationNumber: {
    fontSize: 42,
    fontWeight: "800",
    color: "#0E7490",
    marginTop: 10,
  },

  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },

  statusCard: {
    flex: 1,
    borderRadius: 18,
    padding: 15,
    alignItems: "center",
  },

  goodCard: {
    backgroundColor: "#E8F7EC",
  },

  moderateCard: {
    backgroundColor: "#FFF8DD",
  },

  poorCard: {
    backgroundColor: "#FDECEC",
  },

  statusIcon: {
    fontSize: 20,
    marginBottom: 5,
  },

  statusNumber: {
    fontSize: 26,
    fontWeight: "800",
    color: "#203040",
  },

  statusLabel: {
    fontSize: 14,
    color: "#53626F",
    marginTop: 2,
  },

  metricRow: {
    flexDirection: "row",
    marginTop: 18,
    gap: 10,
  },

  metricBox: {
    flex: 1,
    backgroundColor: "#F5F9FC",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
  },

  metricLabel: {
    fontSize: 13,
    color: "#607D8B",
    textAlign: "center",
  },

  metricValue: {
    fontSize: 23,
    fontWeight: "800",
    color: "#0B3954",
    marginTop: 6,
  },

  metricUnit: {
    fontSize: 11,
    color: "#78909C",
    marginTop: 2,
  },

  footerCard: {
    backgroundColor: "#E7F3F8",
    borderRadius: 18,
    padding: 18,
  },

  footerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0B3954",
  },

  footerText: {
    marginTop: 7,
    lineHeight: 21,
    color: "#48606F",
  },

  refreshText: {
    marginTop: 12,
    fontSize: 12,
    color: "#607D8B",
  },

  errorIcon: {
    fontSize: 55,
    marginBottom: 15,
  },

  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    color: "#9B1C1C",
  },

  errorText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: "center",
    color: "#6B7280",
  },

  retryText: {
    marginTop: 20,
    fontSize: 17,
    fontWeight: "700",
    color: "#0E7490",
  },
});