import React, { useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Trophy,
  Users,
  RefreshCw,
  Sparkles,
  Flame,
  CheckCircle2,
  LogIn,
  LogOut,
  User,
  Activity,
} from "lucide-react-native";
import { StepProgressRing } from "../components/StepProgressRing";
import { QuickActionCard } from "../components/QuickActionCard";
import { useStepStore } from "../stores/useStepStore";
import { useAuthStore } from "../stores/useAuthStore";
import { HealthTrackingService } from "../services/healthTracking";
import {
  calculateCaloriesBurned,
  calculateDistanceMeters,
  calculateRemainingSteps,
  MOTIVATION_MILESTONES,
} from "@stepora/shared";

// API Base URL config: Android emulator uses 10.0.2.2, iOS simulator uses localhost
const API_BASE_URL = Platform.select({
  android: "http://10.0.2.2:8787",
  default: "http://127.0.0.1:8787",
});

export default function HomeScreen() {
  const router = useRouter();
  const { todaySteps, dailyTarget, setSteps, setSyncStatus, isSyncing } = useStepStore();
  const { user, token, isAuthenticated, signOut } = useAuthStore();

  const calories = calculateCaloriesBurned(todaySteps);
  const distance = (calculateDistanceMeters(todaySteps) / 1000).toFixed(2);
  const remaining = calculateRemainingSteps(todaySteps, dailyTarget);

  const handleSync = async () => {
    setSyncStatus(true);
    try {
      const record = await HealthTrackingService.getTodaySteps();
      
      // Send synchronized steps to backend
      const res = await fetch(`${API_BASE_URL}/api/v1/activity/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          deviceId: `mobile-${Platform.OS}-device`,
          platform: Platform.OS === "android" ? "android" : Platform.OS === "ios" ? "ios" : "web",
          records: [record],
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSteps(json.data.todaySummary.totalSteps);
        setSyncStatus(false, new Date().toLocaleTimeString());

        if (json.data.milestoneUnlocked) {
          Alert.alert(
            "🎉 Milestone Unlocked!",
            "Congratulations! You unlocked the 1,000 Steps Daily Milestone!"
          );
        } else {
          Alert.alert(
            "Synchronized with Stepora Cloud",
            `Successfully synced from Health Source. Today's verified total: ${json.data.todaySummary.totalSteps.toLocaleString()} steps.`
          );
        }
      } else {
        // Fallback to local record
        setSteps(record.stepCount);
        setSyncStatus(false, new Date().toLocaleTimeString());
        Alert.alert(
          "Local Sync Completed",
          `Recorded ${record.stepCount.toLocaleString()} steps from health tracking.`
        );
      }
    } catch {
      setSyncStatus(false);
      Alert.alert(
        "Sync Notice",
        "Could not connect to Stepora cloud server. Recorded steps locally."
      );
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* User Session Bar */}
      {isAuthenticated && user ? (
        <View style={styles.userBanner}>
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>{user.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={() => signOut()}
            activeOpacity={0.7}
          >
            <LogOut size={16} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.authBanner}
          onPress={() => router.push("/login")}
          activeOpacity={0.8}
        >
          <View style={styles.authBannerLeft}>
            <LogIn size={18} color="#10b981" />
            <View>
              <Text style={styles.authBannerTitle}>Sign in to save progress</Text>
              <Text style={styles.authBannerSub}>Compete in challenges and view leaderboards</Text>
            </View>
          </View>
          <Text style={styles.authBannerAction}>Sign In &rarr;</Text>
        </TouchableOpacity>
      )}

      {/* Header Sync Status Bar */}
      <View style={styles.syncBar}>
        <View style={styles.syncStatusIndicator}>
          <View style={styles.greenDot} />
          <Text style={styles.syncStatusText}>
            {Platform.OS === "android"
              ? "Health Connect Active"
              : Platform.OS === "ios"
                ? "Apple HealthKit Active"
                : "Health Source Ready"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.syncButton}
          onPress={handleSync}
          disabled={isSyncing}
          activeOpacity={0.8}
        >
          <RefreshCw size={14} color="#022c22" />
          <Text style={styles.syncButtonText}>{isSyncing ? "Syncing..." : "Sync Health"}</Text>
        </TouchableOpacity>
      </View>

      {/* Main Step Ring */}
      <StepProgressRing current={todaySteps} target={dailyTarget} />

      {/* 1,000 Step Milestone Achievement Banner */}
      {todaySteps >= MOTIVATION_MILESTONES.FIRST_MILESTONE && (
        <View style={styles.milestoneCard}>
          <View style={styles.milestoneIconWrap}>
            <Sparkles size={20} color="#f59e0b" />
          </View>
          <View style={styles.milestoneTextWrap}>
            <Text style={styles.milestoneTitle}>1,000 Steps Milestone Unlocked!</Text>
            <Text style={styles.milestoneSubtitle}>
              Great momentum! You crossed your first 1,000 steps today.
            </Text>
          </View>
        </View>
      )}

      {/* Stats Summary Row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{distance} km</Text>
          <Text style={styles.statLabel}>Distance</Text>
        </View>
        <View style={[styles.statBox, styles.statBoxBorder]}>
          <Text style={styles.statValue}>{calories} kcal</Text>
          <Text style={styles.statLabel}>Calories</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{remaining.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Remaining</Text>
        </View>
      </View>

      {/* Quick Navigation Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Challenges</Text>
        <QuickActionCard
          title="Individual Challenge"
          subtitle="Strict 100% daily achievement rule"
          icon={Trophy}
          accentColor="#10b981"
          onPress={() =>
            Alert.alert(
              "Individual Challenge",
              "Synchronized with web application. Complete 100% of your daily target to advance streak."
            )
          }
        />
        <QuickActionCard
          title="Group Challenge"
          subtitle="Compete with friends via unique invite code"
          icon={Users}
          accentColor="#06b6d4"
          onPress={() =>
            Alert.alert(
              "Group Challenges",
              "Scores are computed independently. Check live group standings on web or invite friends."
            )
          }
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  userBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0f172a",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
    padding: 12,
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarText: {
    color: "#022c22",
    fontWeight: "800",
    fontSize: 15,
  },
  userName: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "700",
  },
  userEmail: {
    color: "#94a3b8",
    fontSize: 11,
  },
  signOutBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#1e293b",
  },
  authBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.25)",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  authBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  authBannerTitle: {
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "700",
  },
  authBannerSub: {
    color: "#94a3b8",
    fontSize: 11,
  },
  authBannerAction: {
    color: "#10b981",
    fontSize: 12,
    fontWeight: "700",
  },
  syncBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0f172a",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 10,
  },
  syncStatusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
  },
  syncStatusText: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "500",
  },
  syncButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#10b981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  syncButtonText: {
    color: "#022c22",
    fontSize: 12,
    fontWeight: "700",
  },
  milestoneCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c1917",
    borderColor: "#78350f",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginVertical: 10,
    gap: 12,
  },
  milestoneIconWrap: {
    backgroundColor: "#451a03",
    padding: 10,
    borderRadius: 12,
  },
  milestoneTextWrap: {
    flex: 1,
  },
  milestoneTitle: {
    color: "#fde68a",
    fontSize: 14,
    fontWeight: "700",
  },
  milestoneSubtitle: {
    color: "#d6d3d1",
    fontSize: 12,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 16,
    paddingVertical: 14,
    marginVertical: 14,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statBoxBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#334155",
  },
  statValue: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "800",
  },
  statLabel: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 2,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
});