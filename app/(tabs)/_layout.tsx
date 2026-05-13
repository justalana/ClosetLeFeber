import { Ionicons } from "@expo/vector-icons";
import { Tabs, router } from "expo-router";
import { Platform, TouchableOpacity } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,

        headerStyle: {
          backgroundColor: "#F7F3EE",
        },

        headerShadowVisible: false,

        headerTitleStyle: {
          color: "#2E2925",
          fontWeight: "700",
        },

        headerRight: () => (
          <TouchableOpacity
            onPress={() => router.push("/profile")}
            style={{ marginRight: 18 }}
          >
            <Ionicons name="person-circle-outline" size={30} color="#2E2925" />
          </TouchableOpacity>
        ),

        tabBarActiveTintColor: "#2E2925",
        tabBarInactiveTintColor: "#8B8178",

        tabBarStyle: {
          backgroundColor: "#F7F3EE",
          borderTopWidth: 0,

          height: Platform.OS === "android" ? 90 : 75,
          paddingBottom: Platform.OS === "android" ? 24 : 12,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="closet"
        options={{
          title: "Closet",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shirt-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="outfit"
        options={{
          title: "Outfits",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sparkles-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
