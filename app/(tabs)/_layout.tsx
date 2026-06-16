import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { Tabs, router } from "expo-router";
import { Image, Platform, TouchableOpacity, View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,

        headerStyle: {
          backgroundColor: Colors.background,
        },

        headerShadowVisible: false,

        headerTitleStyle: {
          color: Colors.text,
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
              <Ionicons name="basket-outline" size={28} color={Colors.danger} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/profile")}>
              <Ionicons
                name="person-circle-outline"
                size={30}
                color={Colors.brownLight}
              />
            </TouchableOpacity>
          </View>
        ),

        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,

        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopWidth: 1,
          borderTopColor: Colors.border,

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
