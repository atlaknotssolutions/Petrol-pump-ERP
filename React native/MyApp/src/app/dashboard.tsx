import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { Redirect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { RootState } from "../store";
import { logout } from "./slices/authSlice";

const { width } = Dimensions.get("window");

export default function Dashboard() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/login");
  };

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  const stats = [
    {
      id: 1,
      title: "Total Users",
      value: "1,248",
      icon: "people",
      color: "#4F46E5",
      bg: "#EEF2FF",
    },
    {
      id: 2,
      title: "Revenue",
      value: "₹2.4L",
      icon: "cash",
      color: "#059669",
      bg: "#ECFDF5",
    },
    {
      id: 3,
      title: "Orders",
      value: "356",
      icon: "cart",
      color: "#D97706",
      bg: "#FFFBEB",
    },
    {
      id: 4,
      title: "Growth",
      value: "+12.5%",
      icon: "trending-up",
      color: "#DC2626",
      bg: "#FEF2F2",
    },
  ];

  const quickActions = [
    { id: 1, title: "Add Product", icon: "add-circle", route: "/products/add" },
    { id: 2, title: "View Orders", icon: "list", route: "/orders" },
    { id: 3, title: "Customers", icon: "people", route: "/customers" },
    { id: 4, title: "Reports", icon: "bar-chart", route: "/reports" },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back 👋</Text>
          <Text style={styles.userName}>
            {user?.name || user?.email || "User"}
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          {stats.map((item) => (
            <View key={item.id} style={styles.statCard}>
              <View
                style={[styles.iconContainer, { backgroundColor: item.bg }]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color={item.color}
                />
              </View>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statTitle}>{item.title}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionCard}
              activeOpacity={0.7}
              onPress={() => router.push(action.route as any)}
            >
              <View style={styles.actionIcon}>
                <Ionicons name={action.icon as any} size={26} color="#4F46E5" />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity Placeholder */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <View style={styles.activityItem}>
            <View style={[styles.dot, { backgroundColor: "#22C55E" }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.activityText}>New order received</Text>
              <Text style={styles.activityTime}>2 minutes ago</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <View style={[styles.dot, { backgroundColor: "#3B82F6" }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.activityText}>Payment successful</Text>
              <Text style={styles.activityTime}>15 minutes ago</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <View style={[styles.dot, { backgroundColor: "#F59E0B" }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.activityText}>New user registered</Text>
              <Text style={styles.activityTime}>1 hour ago</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  greeting: {
    fontSize: 14,
    color: "#64748B",
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 2,
  },
  logoutBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 14,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },
  statTitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  actionCard: {
    width: (width - 52) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  activityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  activityText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#0F172A",
  },
  activityTime: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
});
