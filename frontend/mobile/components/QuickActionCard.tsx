import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { LucideIcon } from "lucide-react-native";

interface QuickActionCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  onPress: () => void;
  accentColor?: string;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  subtitle,
  icon: Icon,
  onPress,
  accentColor = "#10b981",
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.iconContainer, { backgroundColor: `${accentColor}1A` }]}>
        <Icon size={24} color={accentColor} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  iconContainer: {
    padding: 12,
    borderRadius: 12,
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 2,
  },
});
