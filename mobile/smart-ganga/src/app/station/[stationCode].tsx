import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import api from "@/services/api";

type StationData = {
  id: number;
  station_code: string;
  monitoring_location: string;
  state: string;
  temperature: number;
  ph: number;
  dissolved_oxygen: number;
  bod: number;
  conductivity: number;
  nitrate: number;
  fecal_coliform: number;
  total_coliform: number;
  status: string;
};

export default function StationDetailsScreen() {
  const router = useRouter();
  const { stationCode } = useLocalSearchParams<{
    stationCode: string;
  }>();

  const [station, setStation] = useState<StationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStation = async () => {
    try {
      setError("");

      const code = decodeURIComponent(String(stationCode));

      const response = await api.get(
        `/live-water/${encodeURIComponent(code)}`
      );

      setStation(response.data?.data ?? response.data);
    } catch (err) {
      console.error("Station details API error:", err);
      setError("Unable to load station details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (stationCode) {
      loadStation();
    }
  }, [stationCode]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Good":
        return "#159447";
      case "Moderate":
        return "#D99A00";
      case "Poor":
        return "#D64545";
      default:
        return "#607D8B";
    }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />

        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0E7490" />
          <Text style={styles.loadingText}>
            Loading station details...
          </Text>
        </View>
      </>
    );
  }

  if (error || !station) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />

        <View style={styles.center}>
          <Text style={styles.errorIcon}>⚠️</Text>

          <Text style={styles.errorTitle}>
            Station Not Available
          </Text>

          <Text style={styles.errorText}>
            {error || "No station data found."}
          </Text>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButtonCircle}
            onPress={() => router.back()}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>
              Station Details
            </Text>

            <Text style={styles.headerSubtitle}>
              Live Water Monitoring
            </Text>
          </View>

          <Text style={styles.wave}>🌊</Text>
        </View>

        {/* Station Information */}
        <View style={styles.stationCard}>
          <View style={styles.stationTop}>
            <View style={styles.stationInfo}>
              <Text style={styles.location}>
                {station.monitoring_location}
              </Text>

              <Text style={styles.stationCode}>
                Station: {station.station_code}
              </Text>

              <Text style={styles.state}>
                {station.state}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: getStatusColor(
                    station.status
                  ),
                },
              ]}
            >
              <Text style={styles.statusText}>
                {station.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Main Status */}
        <View
          style={[
            styles.statusCard,
            {
              borderColor: getStatusColor(
                station.status
              ),
            },
          ]}
        >
          <Text style={styles.statusEmoji}>
            {station.status === "Good"
              ? "🟢"
              : station.status === "Moderate"
              ? "🟡"
              : "🔴"}
          </Text>

          <View style={styles.statusContent}>
            <Text style={styles.statusHeading}>
              Water Quality Status
            </Text>

            <Text
              style={[
                styles.statusLarge,
                {
                  color: getStatusColor(
                    station.status
                  ),
                },
              ]}
            >
              {station.status}
            </Text>
          </View>
        </View>

        {/* Primary Parameters */}
        <Text style={styles.sectionTitle}>
          Water Quality Parameters
        </Text>

        <View style={styles.grid}>
          <ParameterCard
            label="pH"
            value={station.ph}
            unit=""
          />

          <ParameterCard
            label="Temperature"
            value={station.temperature}
            unit="°C"
          />

          <ParameterCard
            label="Dissolved Oxygen"
            value={station.dissolved_oxygen}
            unit="mg/L"
          />

          <ParameterCard
            label="BOD"
            value={station.bod}
            unit="mg/L"
          />

          <ParameterCard
            label="Conductivity"
            value={station.conductivity}
            unit="µmho/cm"
          />

          <ParameterCard
            label="Nitrate"
            value={station.nitrate}
            unit="mg/L"
          />
        </View>

        {/* Microbiological Parameters */}
        <Text style={styles.sectionTitle}>
          Microbiological Parameters
        </Text>

        <View style={styles.microCard}>
          <ParameterRow
            label="Fecal Coliform"
            value={station.fecal_coliform}
            unit="MPN/100ml"
          />

          <ParameterRow
            label="Total Coliform"
            value={station.total_coliform}
            unit="MPN/100ml"
          />
        </View>

        {/* Information */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            🤖 Digital Twin Monitoring
          </Text>

          <Text style={styles.infoText}>
            This station's live values are generated
            from historical monitoring ranges and
            updated automatically by the Smart Ganga
            Digital Twin.
          </Text>
        </View>

        {/* Refresh */}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => {
            setLoading(true);
            loadStation();
          }}
        >
          <Text style={styles.refreshButtonText}>
            ↻ Refresh Station Data
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

function ParameterCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <View style={styles.parameterCard}>
      <Text style={styles.parameterLabel}>
        {label}
      </Text>

      <Text style={styles.parameterValue}>
        {Number(value).toFixed(2)}
      </Text>

      {unit ? (
        <Text style={styles.parameterUnit}>
          {unit}
        </Text>
      ) : null}
    </View>
  );
}

function ParameterRow({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <View style={styles.parameterRow}>
      <Text style={styles.rowLabel}>{label}</Text>

      <View style={styles.rowValueContainer}>
        <Text style={styles.rowValue}>
          {Number(value).toFixed(2)}
        </Text>

        <Text style={styles.rowUnit}>
          {unit}
        </Text>
      </View>
    </View>
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

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#F3F8FC",
  },

  loadingText: {
    marginTop: 15,
    color: "#607D8B",
    fontSize: 16,
  },

  errorIcon: {
    fontSize: 55,
  },

  errorTitle: {
    marginTop: 15,
    fontSize: 24,
    fontWeight: "800",
    color: "#17324D",
  },

  errorText: {
    marginTop: 10,
    textAlign: "center",
    color: "#607D8B",
    fontSize: 15,
  },

  backButton: {
    marginTop: 20,
    backgroundColor: "#0E7490",
    borderRadius: 12,
    paddingHorizontal: 25,
    paddingVertical: 12,
  },

  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  backButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E0E8EE",
  },

  backArrow: {
    fontSize: 24,
    color: "#0B3954",
  },

  headerText: {
    flex: 1,
    marginLeft: 12,
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0B3954",
  },

  headerSubtitle: {
    marginTop: 3,
    color: "#607D8B",
  },

  wave: {
    fontSize: 35,
  },

  stationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },

  stationTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  stationInfo: {
    flex: 1,
    paddingRight: 10,
  },

  location: {
    fontSize: 22,
    fontWeight: "800",
    color: "#17324D",
  },

  stationCode: {
    marginTop: 6,
    fontSize: 14,
    color: "#607D8B",
  },

  state: {
    marginTop: 3,
    fontSize: 14,
    color: "#78909C",
  },

  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },

  statusText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 2,
    padding: 20,
    marginBottom: 24,
  },

  statusEmoji: {
    fontSize: 38,
    marginRight: 15,
  },

  statusContent: {
    flex: 1,
  },

  statusHeading: {
    fontSize: 14,
    color: "#607D8B",
  },

  statusLarge: {
    marginTop: 2,
    fontSize: 28,
    fontWeight: "800",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#17324D",
    marginBottom: 12,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },

  parameterCard: {
    width: "48.5%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    minHeight: 115,
  },

  parameterLabel: {
    fontSize: 13,
    color: "#607D8B",
  },

  parameterValue: {
    marginTop: 8,
    fontSize: 26,
    fontWeight: "800",
    color: "#0B3954",
  },

  parameterUnit: {
    marginTop: 2,
    fontSize: 11,
    color: "#78909C",
  },

  microCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 18,
    marginBottom: 20,
  },

  parameterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F5",
  },

  rowLabel: {
    fontSize: 15,
    color: "#52606D",
  },

  rowValueContainer: {
    alignItems: "flex-end",
  },

  rowValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0B3954",
  },

  rowUnit: {
    marginTop: 2,
    fontSize: 10,
    color: "#78909C",
  },

  infoCard: {
    backgroundColor: "#E7F3F8",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },

  infoTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0B3954",
  },

  infoText: {
    marginTop: 7,
    lineHeight: 21,
    color: "#48606F",
  },

  refreshButton: {
    backgroundColor: "#0E7490",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },

  refreshButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});