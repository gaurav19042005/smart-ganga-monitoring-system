import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { getStations } from "../services/api";

type Station = {
  station_code: string;
  monitoring_location: string;
  state: string;
};

export default function StationsScreen() {
  const router = useRouter();

  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadStations = async () => {
    try {
      const response = await getStations();

      if (Array.isArray(response?.data)) {
        setStations(response.data);
      } else {
        setStations([]);
      }
    } catch (error) {
      console.error("Stations API error:", error);
      setStations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStations();
  }, []);

  const filteredStations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return stations;
    }

    return stations.filter(
      (station) =>
        station.station_code
          .toLowerCase()
          .includes(query) ||
        station.monitoring_location
          .toLowerCase()
          .includes(query) ||
        station.state.toLowerCase().includes(query)
    );
  }, [search, stations]);

  const openStation = (stationCode: string) => {
  router.push({
    pathname: "/station/[stationCode]" as any,
    params: {
      stationCode: stationCode,
    },
  });
};

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#0E7490"
        />

        <Text style={styles.loadingText}>
          Loading stations...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>
            Monitoring Stations
          </Text>

          <Text style={styles.subtitle}>
            All Ganga monitoring locations
          </Text>
        </View>

        <Text style={styles.icon}>📍</Text>
      </View>

      {/* Search */}
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search station, location or state..."
        placeholderTextColor="#78909C"
        style={styles.search}
      />

      {/* Count */}
      <Text style={styles.count}>
        Showing {filteredStations.length} of{" "}
        {stations.length} stations
      </Text>

      {/* Station List */}
      <FlatList
        data={filteredStations}
        keyExtractor={(item, index) =>
          `${item.station_code}-${index}`
        }
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() =>
              openStation(item.station_code)
            }
          >
            <View style={styles.pinCircle}>
              <Text style={styles.pin}>📍</Text>
            </View>

            <View style={styles.info}>
              <Text style={styles.location}>
                {item.monitoring_location}
              </Text>

              <Text style={styles.stationCode}>
                Station Code: {item.station_code}
              </Text>

              <Text style={styles.state}>
                {item.state}
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>
              🔍
            </Text>

            <Text style={styles.emptyTitle}>
              No stations found
            </Text>

            <Text style={styles.emptyText}>
              Try a different search.
            </Text>
          </View>
        }
      />
    </View>
  );
}

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
  },

  loadingText: {
    marginTop: 12,
    color: "#607D8B",
    fontSize: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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

  icon: {
    fontSize: 38,
  },

  search: {
    height: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#DDE8EE",
  },

  count: {
    marginTop: 12,
    marginBottom: 10,
    fontSize: 14,
    color: "#607D8B",
  },

  list: {
    paddingBottom: 30,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E6EEF3",
  },

  pinCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E5F4F7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  pin: {
    fontSize: 22,
  },

  info: {
    flex: 1,
    paddingRight: 10,
  },

  location: {
    fontSize: 17,
    fontWeight: "700",
    color: "#17324D",
  },

  stationCode: {
    marginTop: 5,
    fontSize: 13,
    color: "#607D8B",
  },

  state: {
    marginTop: 3,
    fontSize: 13,
    color: "#78909C",
  },

  arrow: {
    fontSize: 30,
    color: "#0E7490",
  },

  empty: {
    alignItems: "center",
    marginTop: 60,
  },

  emptyIcon: {
    fontSize: 45,
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "700",
    color: "#17324D",
  },

  emptyText: {
    marginTop: 5,
    color: "#78909C",
  },
});