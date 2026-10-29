import { usePathname, useRouter } from "expo-router";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type AppRoute =
  | "/"
  | "/live-water"
  | "/stations"
  | "/map"
  | "/reports"
  | "/alerts"
  | "/profile";

type NavigationItem = {
  label: string;
  icon: string;
  route: AppRoute;
};

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    icon: "⌂",
    route: "/",
  },
  {
    label: "Water Quality",
    icon: "💧",
    route: "/live-water",
  },
  {
    label: "Stations",
    icon: "📍",
    route: "/stations",
  },
  {
    label: "Map",
    icon: "🗺️",
    route: "/map",
  },
  {
    label: "Reports",
    icon: "📄",
    route: "/reports",
  },
  {
    label: "Alerts",
    icon: "🔔",
    route: "/alerts",
  },
  {
    label: "Profile",
    icon: "👤",
    route: "/profile",
  },
];

export default function SmartNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (route: AppRoute) => {
    router.push(route);
  };

  return (
    <View
      style={[
        styles.container,
        Platform.OS === "web"
          ? styles.webContainer
          : styles.mobileContainer,
      ]}
    >
      {/* Brand */}
      <View style={styles.brandSection}>
        <Text style={styles.brandIcon}>🌊</Text>

        <View>
          <Text style={styles.brandTitle}>
            Smart Ganga
          </Text>

          <Text style={styles.brandSubtitle}>
            Protecting Every Drop
          </Text>
        </View>
      </View>

      {/* Navigation */}
      <View
        style={[
          styles.navigation,
          Platform.OS === "web"
            ? styles.webNavigation
            : styles.mobileNavigation,
        ]}
      >
        {navigationItems.map((item) => {
          const isActive =
            item.route === "/"
              ? pathname === "/"
              : pathname.startsWith(item.route);

          return (
            <TouchableOpacity
              key={item.route}
              activeOpacity={0.8}
              onPress={() => handleNavigation(item.route)}
              style={[
                styles.navigationItem,
                isActive && styles.activeNavigationItem,
              ]}
            >
              <Text
                style={[
                  styles.navigationIcon,
                  isActive && styles.activeNavigationIcon,
                ]}
              >
                {item.icon}
              </Text>

              <Text
                style={[
                  styles.navigationLabel,
                  isActive && styles.activeNavigationLabel,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8EE",
    zIndex: 100,
  },

  webContainer: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: 72,
  borderBottomWidth: 1,
  paddingHorizontal: 24,
  paddingVertical: 10,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  zIndex: 1000,
  elevation: 1000,
},


  mobileContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 76,
    borderTopWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },

  brandSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  brandIcon: {
    fontSize: 34,
    marginRight: 10,
  },

  brandTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0B3954",
  },

  brandSubtitle: {
    marginTop: 1,
    fontSize: 11,
    color: "#607D8B",
  },

  navigation: {
    alignItems: "center",
  },

  webNavigation: {
    flexDirection: "row",
    gap: 6,
  },

  mobileNavigation: {
    flexDirection: "row",
    justifyContent: "space-around",
  },

  navigationItem: {
    minWidth: 72,
    minHeight: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  activeNavigationItem: {
    backgroundColor: "#E5F4F7",
  },

  navigationIcon: {
    fontSize: 19,
    marginBottom: 2,
    opacity: 0.75,
  },

  activeNavigationIcon: {
    opacity: 1,
  },

  navigationLabel: {
    fontSize: 11,
    color: "#607D8B",
    fontWeight: "600",
  },

  activeNavigationLabel: {
    color: "#0E7490",
    fontWeight: "800",
  },
});