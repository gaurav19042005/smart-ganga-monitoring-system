import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Href, useRouter } from "expo-router";

import { getLatestWaterData } from "../services/api";

type WaterRecord = {
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

type ApiResponse = {
  status: string;
  total: number;
  data: WaterRecord[];
};

export default function LiveWaterScreen() {
  const router = useRouter();

  const [stations, setStations] = useState<WaterRecord[]>([]);
  const [filteredStations, setFilteredStations] = useState<
    WaterRecord[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const [error, setError] = useState("");

  // =====================================================
  // Load Live Water Data
  // =====================================================
  const loadStations = useCallback(async () => {
    try {
      setError("");

      const response =
        (await getLatestWaterData()) as ApiResponse;

      if (
        !response ||
        !Array.isArray(response.data)
      ) {
        throw new Error(
          "Invalid response received from server."
        );
      }

      setStations(response.data);
    } catch (err) {
      console.error(
        "Live water API error:",
        err
      );

      setError(
        "Unable to load live water data. Please check the backend connection."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // =====================================================
  // Initial Load + Auto Refresh
  // =====================================================
  useEffect(() => {
    loadStations();

    const interval = setInterval(() => {
      loadStations();
    }, 15000);

    return () => clearInterval(interval);
  }, [loadStations]);

  // =====================================================
  // Filter Stations
  // =====================================================
  useEffect(() => {
    const query = search
      .trim()
      .toLowerCase();

    const filtered = stations.filter(
      (station) => {
        const matchesSearch =
          query === "" ||
          String(
            station.station_code
          )
            .toLowerCase()
            .includes(query) ||
          String(
            station.monitoring_location
          )
            .toLowerCase()
            .includes(query) ||
          String(station.state)
            .toLowerCase()
            .includes(query);

        const matchesStatus =
          selectedStatus === "All" ||
          station.status === selectedStatus;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );

    setFilteredStations(filtered);
  }, [
    search,
    selectedStatus,
    stations,
  ]);

  // =====================================================
  // Manual Refresh
  // =====================================================
  const handleRefresh = () => {
    setRefreshing(true);
    loadStations();
  };

  // =====================================================
  // Open Station Details
  // =====================================================
  const openStation = (stationCode: string) => {
  router.push({
    pathname: "/station/[stationCode]" as any,
    params: {
      stationCode: stationCode,
    },
  });
};
  // =====================================================
  // Status Color
  // =====================================================
  const getStatusColor = (
    status: string
  ) => {
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

  // =====================================================
  // Loading Screen
  // =====================================================
  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingIcon}>
          🌊
        </Text>

        <ActivityIndicator
          size="large"
          color="#0E7490"
        />

        <Text style={styles.loadingTitle}>
          Loading Live Water Quality
        </Text>

        <Text style={styles.loadingText}>
          Fetching monitoring station data...
        </Text>
      </View>
    );
  }

  // =====================================================
  // Error Screen
  // =====================================================
  if (
    error &&
    stations.length === 0
  ) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>
          ⚠️
        </Text>

        <Text style={styles.errorTitle}>
          Unable to Load Water Data
        </Text>

        <Text style={styles.errorText}>
          {error}
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={handleRefresh}
        >
          <Text
            style={styles.retryButtonText}
          >
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // =====================================================
  // Main Screen
  // =====================================================
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View
          style={
            styles.headerTextContainer
          }
        >
          <Text style={styles.title}>
            Live Water Quality
          </Text>

          <Text style={styles.subtitle}>
            Real-time monitoring across the
            Ganga
          </Text>
        </View>

        <Text style={styles.wave}>
          🌊
        </Text>
      </View>

      {/* Search */}
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search station, location or state..."
        placeholderTextColor="#78909C"
        style={styles.search}
      />

      {/* Status Filters */}
      <View style={styles.filters}>
        {[
          "All",
          "Good",
          "Moderate",
          "Poor",
        ].map((status) => (
          <TouchableOpacity
            key={status}
            onPress={() =>
              setSelectedStatus(
                status
              )
            }
            style={[
              styles.filterButton,
              selectedStatus ===
                status &&
                styles.activeFilter,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                selectedStatus ===
                  status &&
                  styles.activeFilterText,
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Result Information */}
      <View style={styles.resultRow}>
        <Text style={styles.resultText}>
          Showing{" "}
          {filteredStations.length}{" "}
          of {stations.length} stations
        </Text>

        <TouchableOpacity
          onPress={handleRefresh}
        >
          <Text
            style={styles.refreshButton}
          >
            ↻ Refresh
          </Text>
        </TouchableOpacity>
      </View>

      {/* API Warning */}
      {error ? (
        <View
          style={styles.warningBanner}
        >
          <Text
            style={styles.warningText}
          >
            ⚠️ {error}
          </Text>
        </View>
      ) : null}

      {/* Station List */}
      <FlatList
        data={filteredStations}
        keyExtractor={(
          item,
          index
        ) =>
          item.id
            ? String(item.id)
            : `${item.station_code}-${index}`
        }
        contentContainerStyle={
          styles.list
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={
              handleRefresh
            }
            colors={["#0E7490"]}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            style={
              styles.stationCard
            }
            onPress={() =>
              openStation(
                item.station_code
              )
            }
          >
            {/* Station Header */}
            <View
              style={
                styles.stationHeader
              }
            >
              <View
                style={
                  styles.stationInfo
                }
              >
                <Text
                  style={
                    styles.location
                  }
                >
                  {
                    item.monitoring_location
                  }
                </Text>

                <Text
                  style={
                    styles.stationCode
                  }
                >
                  Station:{" "}
                  {item.station_code}
                </Text>

                <Text
                  style={styles.state}
                >
                  {item.state}
                </Text>
              </View>

              {/* Status */}
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      getStatusColor(
                        item.status
                      ),
                  },
                ]}
              >
                <Text
                  style={
                    styles.statusText
                  }
                >
                  {item.status}
                </Text>
              </View>
            </View>

            {/* Water Quality Metrics */}
            <View
              style={styles.metrics}
            >
              {/* pH */}
              <View
                style={styles.metric}
              >
                <Text
                  style={
                    styles.metricLabel
                  }
                >
                  pH
                </Text>

                <Text
                  style={
                    styles.metricValue
                  }
                >
                  {Number(
                    item.ph
                  ).toFixed(2)}
                </Text>
              </View>

              {/* DO */}
              <View
                style={styles.metric}
              >
                <Text
                  style={
                    styles.metricLabel
                  }
                >
                  DO
                </Text>

                <Text
                  style={
                    styles.metricValue
                  }
                >
                  {Number(
                    item.dissolved_oxygen
                  ).toFixed(2)}
                </Text>

                <Text
                  style={
                    styles.metricUnit
                  }
                >
                  mg/L
                </Text>
              </View>

              {/* BOD */}
              <View
                style={styles.metric}
              >
                <Text
                  style={
                    styles.metricLabel
                  }
                >
                  BOD
                </Text>

                <Text
                  style={
                    styles.metricValue
                  }
                >
                  {Number(
                    item.bod
                  ).toFixed(2)}
                </Text>

                <Text
                  style={
                    styles.metricUnit
                  }
                >
                  mg/L
                </Text>
              </View>

              {/* Temperature */}
              <View
                style={styles.metric}
              >
                <Text
                  style={
                    styles.metricLabel
                  }
                >
                  Temp
                </Text>

                <Text
                  style={
                    styles.metricValue
                  }
                >
                  {Number(
                    item.temperature
                  ).toFixed(1)}
                  °
                </Text>

                <Text
                  style={
                    styles.metricUnit
                  }
                >
                  C
                </Text>
              </View>
            </View>

            {/* Click hint */}
            <Text
              style={
                styles.detailsHint
              }
            >
              Tap to view complete station
              details →
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View
            style={
              styles.emptyContainer
            }
          >
            <Text
              style={styles.emptyIcon}
            >
              🔍
            </Text>

            <Text
              style={styles.emptyText}
            >
              No monitoring stations
              found.
            </Text>

            <Text
              style={
                styles.emptySubtext
              }
            >
              Try changing your search
              or filter.
            </Text>
          </View>
        }
      />
    </View>
  );
}

// =====================================================
// Styles
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F8FC",
    padding: 20,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F8FC",
    paddingHorizontal: 30,
  },

  loadingIcon: {
    fontSize: 60,
    marginBottom: 15,
  },

  loadingTitle: {
    marginTop: 18,
    fontSize: 20,
    fontWeight: "700",
    color: "#0B3954",
    textAlign: "center",
  },

  loadingText: {
    marginTop: 7,
    fontSize: 14,
    color: "#607D8B",
    textAlign: "center",
  },

  errorIcon: {
    fontSize: 55,
    marginBottom: 15,
  },

  errorTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: "#9B1C1C",
    textAlign: "center",
  },

  errorText: {
    marginTop: 10,
    fontSize: 15,
    color: "#607D8B",
    textAlign: "center",
    lineHeight: 22,
  },

  retryButton: {
    marginTop: 22,
    backgroundColor: "#0E7490",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 12,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  headerTextContainer: {
    flex: 1,
    paddingRight: 10,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0B3954",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#607D8B",
  },

  wave: {
    fontSize: 40,
  },

  search: {
    height: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#E1EAF0",
    marginBottom: 14,
  },

  filters: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    flexWrap: "wrap",
  },

  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9E5EC",
  },

  activeFilter: {
    backgroundColor: "#0E7490",
    borderColor: "#0E7490",
  },

  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#52606D",
  },

  activeFilterText: {
    color: "#FFFFFF",
  },

  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  resultText: {
    fontSize: 14,
    color: "#607D8B",
  },

  refreshButton: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0E7490",
  },

  warningBanner: {
    backgroundColor: "#FFF8DD",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },

  warningText: {
    color: "#8A6100",
    fontSize: 13,
  },

  list: {
    paddingBottom: 30,
  },

  stationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E7EEF3",
  },

  stationHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  stationInfo: {
    flex: 1,
    paddingRight: 10,
  },

  location: {
    fontSize: 19,
    fontWeight: "700",
    color: "#17324D",
  },

  stationCode: {
    marginTop: 4,
    fontSize: 13,
    color: "#607D8B",
  },

  state: {
    marginTop: 2,
    fontSize: 13,
    color: "#78909C",
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },

  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  metrics: {
    flexDirection: "row",
    gap: 8,
    marginTop: 18,
  },

  metric: {
    flex: 1,
    backgroundColor: "#F5F9FC",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
  },

  metricLabel: {
    fontSize: 11,
    color: "#78909C",
  },

  metricValue: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "700",
    color: "#0B3954",
  },

  metricUnit: {
    marginTop: 2,
    fontSize: 9,
    color: "#78909C",
  },

  detailsHint: {
    marginTop: 12,
    textAlign: "right",
    fontSize: 12,
    fontWeight: "600",
    color: "#0E7490",
  },

  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
    paddingHorizontal: 20,
  },

  emptyIcon: {
    fontSize: 45,
    marginBottom: 10,
  },

  emptyText: {
    fontSize: 16,
    color: "#607D8B",
    textAlign: "center",
  },

  emptySubtext: {
    marginTop: 5,
    fontSize: 13,
    color: "#90A4AE",
    textAlign: "center",
  },
});