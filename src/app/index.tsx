import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { supabase } from "@/lib/supabase";

export default function IndexScreen() {
  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (active) {
          router.replace(session ? "/(tabs)" : "/login");
        }
      } catch (error) {
        console.error("Failed to check login session:", error);

        if (active) {
          router.replace("/login");
        }
      }
    }

    checkSession();

    return () => {
      active = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#34857B" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F8F7",
    justifyContent: "center",
    alignItems: "center",
  },
});
