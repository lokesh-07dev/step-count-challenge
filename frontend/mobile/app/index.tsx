import React from "react";
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Trophy, Users, RefreshCw, Sparkles, Flame, CheckCircle2 } from "lucide-react-native";
import { StepProgressRing } from "../components/StepProgressRing";
import { QuickActionCard } from "../components/QuickActionCard";
import { useStepStore } from "../stores/useStepStore";
import { HealthTrackingService } from "../services/healthTracking";
import {
  calculateCaloriesBurned,
  calculateDistanceMeters,
  calculateRemainingSteps,
  MOTIVATION_MILESTONES,
} from "@stepora/shared";

export default function HomeScreen() {
  const { todaySteps, dailyTarget, setSteps, setSyncStatus, isSyncing } = useStepStore();

  const calories = calculateCaloriesBurned(todaySteps);
  const distance = (calculateDistanceMeters(todaySteps) / 1000).toFixed(2);
  const remaining = calculateRemainingSteps(todaySteps, dailyTarget);

  const handleSync = async () => {
    setSyncStatus(true);
    try {
      const record = await HealthTrackingService.getTodaySteps();
      setSteps(record.stepCount);
      setSyncStatus(false, new Date().toLocaleTimeString());
      Alert.alert(
        "Synchronized",
        `Successfully updated step count from device: ${record.stepCount} steps.`
      );
    } catch {
      setSyncStatus(false);
      Alert.alert("Sync Error", "Could not synchronize steps from health source.");
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Header Sync Status Bar */}
      <View style={styles.syncBar}>
        <View style={styles.syncStatusIndicator}>
          <View style={styles.greenDot} />
          <Text style={styles.syncStatusText}>Health Connect / HealthKit Ready</Text>
        </View>
        <TouchableOpacity
          style={styles.syncButton}
          onPress={handleSync}
          disabled={isSyncing}
          activeOpacity={0.8}
        >
          <RefreshCw size={14} color="#022c22" />
          <Text style={styles.syncButtonText}>{isSyncing ? "Syncing..." : "Sync"}</Text>
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
          subtitle="30-Day Healthy Stepper • Day 12 of 30"
          icon={Trophy}
          accentColor="#10b981"
          onPress={() =>
            Alert.alert("Individual Challenge", "Challenge details will open in Phase 5.")
          }
        />
        <QuickActionCard
          title="Group Challenge"
          subtitle="Weekend Striders • Rank #2 of 8"
          icon={Users}
          accentColor="#06b6d4"
          onPress={() => Alert.alert("Group Challenge", "Group leaderboard will open in Phase 6.")}
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
