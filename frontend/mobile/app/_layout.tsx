import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: "#020617" },
            headerTintColor: "#f8fafc",
            headerTitleStyle: { fontWeight: "bold" },
            contentStyle: { backgroundColor: "#020617" },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: "Stepora",
              headerShown: true,
            }}
          />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
