/// <reference types="google.maps" />

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getMapLocations } from "../services/api";

type MapLocation = {
  [key: string]: unknown;
  id?: number | string | null;
  station_code?: string | null;
  location?: string | null;
  monitoring_location?: string | null;
  state?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  water_quality_category?: string | null;
  status?: string | null;
  pH?: number | string | null;
  ph?: number | string | null;
  temperature?: number | string | null;
  dissolved_oxygen?: number | string | null;
  bod?: number | string | null;
  conductivity?: number | string | null;
  nitrate?: number | string | null;
  nitrate_n?: number | string | null;
  fecal_coliform?: number | string | null;
  total_coliform?: number | string | null;
};

const getLocationName = (station: MapLocation) =>
  station.location ||
  station.monitoring_location ||
  station.station_code ||
  "Unnamed station";

const getQuality = (station: MapLocation) =>
  station.water_quality_category ||
  station.status ||
  (station as any).waterQualityCategory ||
  "Not classified";

const getStatusColor = (category?: string | null) => {
  const value = (category || "").toLowerCase();
  if (value.includes("excellent") || value.includes("good")) return "#16A34A";
  if (value.includes("moderate") || value.includes("fair")) return "#D97706";
  if (
    value.includes("poor") ||
    value.includes("polluted") ||
    value.includes("severe")
  ) return "#DC2626";
  return "#64748B";
};

const hasCoordinates = (station: MapLocation) => {
  const lat = Number(station.latitude);
  const lng = Number(station.longitude);
  return (
    station.latitude != null &&
    station.longitude != null &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  );
};

const getParameterValue = (station: MapLocation, keys: string[]) => {
  for (const key of keys) {
    const value = station[key];
    if (value !== null && value !== undefined && value !== "") return value;
  }
  return null;
};

const displayValue = (value: unknown, unit = "") =>
  value === null || value === undefined || value === ""
    ? "Not available"
    : `${String(value)}${unit ? ` ${unit}` : ""}`;

const PARAMETER_ROWS: { label: string; keys: string[]; unit: string }[] = [
  { label: "pH", keys: ["pH", "ph"], unit: "" },
  { label: "Temperature", keys: ["temperature", "temperature_c", "temp"], unit: "°C" },
  { label: "Dissolved Oxygen", keys: ["dissolved_oxygen", "dissolvedOxygen", "do"], unit: "mg/L" },
  { label: "BOD", keys: ["bod", "bod_mg_l"], unit: "mg/L" },
  { label: "Conductivity", keys: ["conductivity"], unit: "µS/cm" },
  { label: "Nitrate", keys: ["nitrate", "nitrate_n", "nitrateN"], unit: "mg/L" },
  { label: "Fecal Coliform", keys: ["fecal_coliform", "fecalColiform"], unit: "MPN/100 mL" },
  { label: "Total Coliform", keys: ["total_coliform", "totalColiform"], unit: "MPN/100 mL" },
];

export default function MapScreen() {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [selected, setSelected] = useState<MapLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const infoWindow = useRef<any>(null);

  const loadLocations = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getMapLocations();
      const rows = Array.isArray(response?.data) ? response.data : [];
      setLocations(rows.filter(hasCoordinates));
      if (!Array.isArray(response?.data)) {
        setError("The map API did not return a data array. Check /map/locations in the backend.");
      }
    } catch (e) {
      console.error("Map API error:", e);
      setError("Could not load locations. Check that the backend is running and the API URL is correct.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLocations();
  }, [loadLocations]);

  useEffect(() => {
    if (Platform.OS !== "web" || loading || error || !mapContainer.current) return;

    let cancelled = false;

    async function createMap() {
      try {
        const key = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
        const mapId = process.env.EXPO_PUBLIC_GOOGLE_MAP_ID;

        if (!key) {
          setError("Google Maps API key is missing. Add EXPO_PUBLIC_GOOGLE_MAPS_API_KEY to mobile/smart-ganga/.env.");
          return;
        }
        if (!mapId) {
          setError("Google Map ID is missing. Add EXPO_PUBLIC_GOOGLE_MAP_ID to mobile/smart-ganga/.env.");
          return;
        }

        const loader = await import("@googlemaps/js-api-loader");
        loader.setOptions({ key, v: "weekly" });
        const mapsLibrary: any = await loader.importLibrary("maps");
        const markerLibrary: any = await loader.importLibrary("marker");
        const coreLibrary: any = await loader.importLibrary("core");
        const { Map, InfoWindow } = mapsLibrary;
        const { AdvancedMarkerElement } = markerLibrary;

        if (cancelled || !mapContainer.current) return;

        const map = new Map(mapContainer.current, {
          center: { lat: 25.3, lng: 83.0 },
          zoom: 6,
          mapId,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          mapTypeId: "roadmap",
        });

        mapInstance.current = map;
        infoWindow.current = new InfoWindow();

        markers.current.forEach((marker) => { marker.map = null; });
        markers.current = [];

        const validLocations = locations.filter(hasCoordinates);

        validLocations.forEach((station) => {
          const category = String(getQuality(station));
          const color = getStatusColor(category);
          const pin = document.createElement("div");
          pin.style.width = "16px";
          pin.style.height = "16px";
          pin.style.borderRadius = "50%";
          pin.style.backgroundColor = color;
          pin.style.border = "2px solid white";
          pin.style.boxShadow = "0 1px 5px rgba(0,0,0,0.5)";
          pin.title = getLocationName(station);

          const marker = new AdvancedMarkerElement({
            map,
            position: {
              lat: Number(station.latitude),
              lng: Number(station.longitude),
            },
            title: getLocationName(station),
            content: pin,
          });

          marker.addListener("click", () => {
            setSelected(station);

            const content = document.createElement("div");
            content.style.padding = "10px";
            content.style.maxWidth = "290px";
            content.style.maxHeight = "360px";
            content.style.overflowY = "auto";
            content.style.fontFamily = "Arial, sans-serif";
            content.style.color = "#123B5D";

            const heading = document.createElement("h3");
            heading.textContent = getLocationName(station);
            heading.style.margin = "0 0 8px";
            heading.style.fontSize = "17px";
            content.appendChild(heading);

            const state = document.createElement("p");
            state.textContent = `State: ${station.state || "Not available"}`;
            state.style.margin = "4px 0";
            content.appendChild(state);

            const quality = document.createElement("p");
            quality.textContent = `Water Quality: ${category}`;
            quality.style.margin = "4px 0 10px";
            quality.style.fontWeight = "bold";
            quality.style.color = color;
            content.appendChild(quality);

            const separator = document.createElement("hr");
            separator.style.border = "0";
            separator.style.borderTop = "1px solid #E2E8F0";
            content.appendChild(separator);

            const parametersTitle = document.createElement("strong");
            parametersTitle.textContent = "Water Quality Parameters";
            content.appendChild(parametersTitle);

            const list = document.createElement("div");
            list.style.marginTop = "6px";

            PARAMETER_ROWS.forEach(({ label, keys, unit }) => {
              const row = document.createElement("p");
              row.style.margin = "5px 0";
              const value = getParameterValue(station, keys);
              row.textContent = `${label}: ${displayValue(value, unit)}`;
              list.appendChild(row);
            });

            content.appendChild(list);
            infoWindow.current?.setContent(content);
            infoWindow.current?.open({ map, anchor: marker });
          });

          markers.current.push(marker);
        });

        if (validLocations.length > 0) {
          const bounds = new coreLibrary.LatLngBounds();
          validLocations.forEach((station) => {
            bounds.extend({
              lat: Number(station.latitude),
              lng: Number(station.longitude),
            });
          });
          map.fitBounds(bounds);
        }
      } catch (e) {
        console.error("Google Maps error:", e);
        if (!cancelled) {
          setError("Google Maps could not load. Check the API key, Maps JavaScript API, billing, key restrictions, and Map ID.");
        }
      }
    }

    void createMap();

    return () => {
      cancelled = true;
      markers.current.forEach((marker) => { marker.map = null; });
      markers.current = [];
      mapInstance.current = null;
      infoWindow.current = null;
    };
  }, [locations, loading, error]);

  const focusStation = (station: MapLocation) => {
    setSelected(station);
    if (mapInstance.current && hasCoordinates(station)) {
      mapInstance.current.panTo({
        lat: Number(station.latitude),
        lng: Number(station.longitude),
      });
      mapInstance.current.setZoom(12);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Ganga Monitoring Map</Text>
          <Text style={styles.subtitle}>Water quality monitoring stations</Text>
        </View>
        <Pressable style={styles.refreshButton} onPress={() => void loadLocations()}>
          <Text style={styles.refreshText}>Refresh</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{locations.length}</Text>
          <Text style={styles.summaryLabel}>Stations with valid coordinates</Text>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#087EA4" />
            <Text style={styles.muted}>Loading station data...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Map unavailable</Text>
            <Text style={styles.muted}>{error}</Text>
            <Pressable style={styles.refreshButton} onPress={() => void loadLocations()}>
              <Text style={styles.refreshText}>Try Again</Text>
            </Pressable>
          </View>
        ) : Platform.OS === "web" ? (
          <View style={styles.mapBox}>
            <View
              ref={(element) => { mapContainer.current = element as HTMLDivElement | null; }}
              style={{ width: "100%", height: 440 } as any}
            />
          </View>
        ) : (
          <View style={styles.errorCard}>
            <Text style={styles.sectionTitle}>Google Map</Text>
            <Text style={styles.muted}>
              This Google Maps JavaScript map is configured for web. A native map component is needed for Android or iOS.
            </Text>
          </View>
        )}

        <View style={styles.legend}>
          <Text style={styles.sectionTitle}>Water Quality Legend</Text>
          <Text style={styles.legendText}>🟢 Excellent / Good</Text>
          <Text style={styles.legendText}>🟠 Moderate / Fair</Text>
          <Text style={styles.legendText}>🔴 Poor / Polluted</Text>
          <Text style={styles.legendText}>⚪ Unclassified</Text>
        </View>

        {selected && (
          <View style={styles.selectedCard}>
            <Text style={styles.sectionTitle}>Selected Station</Text>
            <Text style={styles.stationName}>{getLocationName(selected)}</Text>
            <Text style={styles.detail}>Station code: {selected.station_code || "Not available"}</Text>
            <Text style={styles.detail}>State: {selected.state || "Not available"}</Text>
            <Text style={[styles.detail, { color: getStatusColor(String(getQuality(selected))), fontWeight: "700" }]}>
              Water quality: {String(getQuality(selected))}
            </Text>
            <Text style={styles.detail}>Latitude: {selected.latitude ?? "Not available"}</Text>
            <Text style={styles.detail}>Longitude: {selected.longitude ?? "Not available"}</Text>
            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Water Quality Parameters</Text>
            {PARAMETER_ROWS.map(({ label, keys, unit }) => (
              <Text key={label} style={styles.detail}>
                {label}: {displayValue(getParameterValue(selected, keys), unit)}
              </Text>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>Monitoring Stations</Text>
        {locations.length === 0 && !loading ? (
          <Text style={styles.muted}>No locations with valid coordinates were returned by the API.</Text>
        ) : (
          locations.map((station, index) => (
            <Pressable
              key={`${station.station_code || getLocationName(station)}-${index}`}
              style={styles.stationCard}
              onPress={() => focusStation(station)}
            >
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(String(getQuality(station))) }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.stationName}>{getLocationName(station)}</Text>
                <Text style={styles.muted}>{station.state || "State unavailable"}</Text>
                <Text style={styles.quality}>{String(getQuality(station))}</Text>
                <Text style={styles.coordinates}>{station.latitude}, {station.longitude}</Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F8FC" },
  header: {
    minHeight: 88, paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E2E8F0",
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12,
  },
  headerText: { flex: 1 },
  title: { fontSize: 23, fontWeight: "700", color: "#123B5D" },
  subtitle: { marginTop: 4, fontSize: 14, color: "#64748B" },
  refreshButton: {
    backgroundColor: "#123B5D", paddingHorizontal: 16, paddingVertical: 11,
    borderRadius: 8, alignSelf: "flex-start",
  },
  refreshText: { color: "#FFFFFF", fontWeight: "600" },
  content: { padding: 20, paddingBottom: 80 },
  summaryCard: {
    backgroundColor: "#FFFFFF", padding: 20, borderRadius: 14, marginBottom: 18,
    borderWidth: 1, borderColor: "#E2E8F0",
  },
  summaryNumber: { fontSize: 32, fontWeight: "700", color: "#123B5D" },
  summaryLabel: { marginTop: 4, color: "#64748B" },
  mapBox: {
    overflow: "hidden", borderRadius: 14, marginBottom: 20,
    borderWidth: 1, borderColor: "#D5E2EC", backgroundColor: "#E5EDF4",
  },
  center: { padding: 30, alignItems: "center" },
  muted: { color: "#64748B", marginTop: 6, lineHeight: 21 },
  errorCard: { backgroundColor: "#FFFFFF", padding: 20, borderRadius: 12, marginBottom: 20, gap: 10 },
  errorTitle: { fontSize: 20, fontWeight: "700", color: "#B91C1C" },
  sectionTitle: { fontSize: 19, fontWeight: "700", color: "#123B5D", marginBottom: 12 },
  legend: { padding: 18, backgroundColor: "#FFFFFF", borderRadius: 12, marginBottom: 20 },
  legendText: { color: "#334155", marginVertical: 4 },
  selectedCard: {
    padding: 18, borderRadius: 12, backgroundColor: "#FFFFFF",
    borderWidth: 1, borderColor: "#B8DDEB", marginBottom: 22,
  },
  stationName: { fontSize: 16, fontWeight: "700", color: "#123B5D" },
  detail: { color: "#475569", marginTop: 7 },
  stationCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 12, backgroundColor: "#FFFFFF",
    borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: "#E2E8F0",
  },
  statusDot: { width: 13, height: 13, borderRadius: 7, marginTop: 5 },
  quality: { marginTop: 5, color: "#334155", fontWeight: "600" },
  coordinates: { marginTop: 5, color: "#64748B", fontSize: 12 },
});

