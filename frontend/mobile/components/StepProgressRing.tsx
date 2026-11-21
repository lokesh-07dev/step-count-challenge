import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Footprints } from "lucide-react-native";
import { calculateProgressPercentage } from "@stepora/shared";

interface StepProgressRingProps {
  current: number;
  target: number;
}

export const StepProgressRing: React.FC<StepProgressRingProps> = ({ current, target }) => {
  const percentage = calculateProgressPercentage(current, target);

  return (
    <View style={styles.container}>
      <View style={styles.outerRing}>
        <View style={styles.innerContent}>
          <Footprints size={36} color="#10b981" />
          <Text style={styles.stepValue}>{current.toLocaleString()}</Text>
          <Text style={styles.stepLabel}>steps today</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {percentage}% of {target.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  outerRing: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 8,
    borderColor: "#065f46",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#022c22",
  },
  innerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  stepValue: {
    fontSize: 40,
    fontWeight: "900",
    color: "#f8fafc",
    marginTop: 6,
  },
  stepLabel: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  badge: {
    marginTop: 8,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    borderColor: "#10b981",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: "#34d399",
    fontSize: 12,
    fontWeight: "700",
  },
});
