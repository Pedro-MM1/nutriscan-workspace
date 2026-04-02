import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";

function TabIcon({
  name,
  color,
  focused,
}: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  focused: boolean;
}) {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: 44,
        height: 32,
        borderRadius: 10,
        backgroundColor: focused ? "#EFF6FF" : "transparent",
      }}
    >
      <Ionicons name={name} size={focused ? 24 : 22} color={color} />
      {focused && (
        <View
          style={{
            position: "absolute",
            bottom: -6,
            width: 5,
            height: 5,
            borderRadius: 999,
            backgroundColor: "#2563EB",
          }}
        />
      )}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E2E8F0",
          borderTopWidth: 1,
          height: 78,
          paddingTop: 10,
          paddingBottom: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="scanner"
        options={{
          title: "Scanner",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="scan" color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="progress"
        options={{
          title: "Progresso",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="bar-chart" color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person" color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="diet"
        options={{
          title: "Dieta",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="restaurant-outline" color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="diary"
        options={{
          title: "Diário",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="book-outline" color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="ai-coach"
        options={{
          title: "AI Coach",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="chatbubble-ellipses-outline" color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="workouts"
        options={{
          title: "Treinos",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="barbell-outline" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
