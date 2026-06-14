import { Ionicons } from "@expo/vector-icons";
import { Tabs, router } from "expo-router";
import { Image, Platform, TouchableOpacity, View } from "react-native";

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
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              marginRight: 18,
            }}
          >
            <TouchableOpacity
              onPress={() => router.push("/declutter-basket" as any)}
            >
              <Ionicons name="basket-outline" size={28} color="#2E2925" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/profile")}>
              <Ionicons
                name="person-circle-outline"
                size={30}
                color="#2E2925"
              />
            </TouchableOpacity>
          </View>
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
          tabBarIcon: ({ color, size, focused }) => (
            <Image
              source={require("../../assets/images/closet.png")}
              style={{
                width: size,
                height: size,
                tintColor: color, // zorgt ervoor dat actief/inactief nog werkt
              }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="declutter"
        options={{
          title: "Declutter",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trash-outline" size={size} color={color} />
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
          tabBarIcon: ({ color, size, focused }) => (
            <Image
              source={require("../../assets/images/outfit.png")}
              style={{
                width: size,
                height: size,
                tintColor: color, // zorgt ervoor dat actief/inactief nog werkt
              }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="declutter-basket"
        options={{
          title: "Decluttermand",
          href: null,
        }}
      />
    </Tabs>
  );
}
