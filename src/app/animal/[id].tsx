import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { supabase } from "@/lib/supabase";

type Animal = {
  id: string;
  common_name: string;
  scientific_name: string;
  description: string | null;
  habitat: string | null;
  diet: string | null;
  average_height: string | null;
  average_weight: string | null;
  conservation_status: string | null;
  cover_image_url: string | null;
};

const C = {
  teal: "#34857B",
  pale: "#E9F1F0",
  white: "#FFFFFF",
  bg: "#F5F7F8",
  text: "#1C2B23",
  muted: "#8E9A94",
  border: "#E5EAE8",
  orange: "#FF6A48",
};

export default function AnimalInfoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAnimal() {
      if (!id) {
        setError("No animal ID was provided.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const { data, error: queryError } = await supabase
        .from("species")
        .select(
          "id, common_name, scientific_name, description, habitat, diet, average_height, average_weight, conservation_status, cover_image_url",
        )
        .eq("id", id)
        .eq("is_published", true)
        .maybeSingle();

      if (!active) return;

      if (queryError) {
        console.error("Error loading animal:", queryError.message);
        setError("Unable to load animal information. Please try again.");
        setAnimal(null);
      } else if (!data) {
        setError("This animal was not found or has not been published yet.");
        setAnimal(null);
      } else {
        setAnimal(data as Animal);
      }

      setLoading(false);
    }

    loadAnimal();

    return () => {
      active = false;
    };
  }, [id]);

  return (
    <View style={styles.screen}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>‹ Back</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.teal} />
          <Text style={styles.message}>Loading animal information...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>Animal unavailable</Text>
          <Text style={styles.message}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.retryText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      ) : animal ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {animal.cover_image_url ? (
            <Image
              source={{ uri: animal.cover_image_url }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Text style={styles.placeholderText}>No image available</Text>
            </View>
          )}

          <View style={styles.details}>
            <Text style={styles.eyebrow}>MEET THE WILDLIFE</Text>
            <Text style={styles.title}>{animal.common_name}</Text>
            <Text style={styles.scientific}>{animal.scientific_name}</Text>

            {animal.conservation_status ? (
              <View style={styles.statusChip}>
                <Text style={styles.statusText}>
                  Conservation status: {animal.conservation_status}
                </Text>
              </View>
            ) : null}

            <InfoSection title="About this animal" value={animal.description} />
            <InfoSection title="Habitat" value={animal.habitat} />
            <InfoSection title="Diet" value={animal.diet} />
            <InfoSection title="Average height" value={animal.average_height} />
            <InfoSection title="Average weight" value={animal.average_weight} />

            <Text style={styles.footer}>
              Learn about wildlife and help protect biodiversity.
            </Text>
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
}

function InfoSection({
  title,
  value,
}: {
  title: string;
  value: string | null;
}) {
  if (!value?.trim()) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 22,
    paddingVertical: 15,
  },
  backText: {
    color: C.teal,
    fontSize: 16,
    fontWeight: "800",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 30,
  },
  image: {
    width: "100%",
    height: 275,
    backgroundColor: "#EAEAEA",
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.pale,
  },
  placeholderText: {
    color: C.muted,
    fontSize: 14,
  },
  details: {
    paddingHorizontal: 22,
    paddingTop: 22,
  },
  eyebrow: {
    color: C.orange,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 6,
  },
  title: {
    color: C.text,
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 5,
  },
  scientific: {
    color: C.muted,
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 15,
  },
  statusChip: {
    alignSelf: "flex-start",
    backgroundColor: C.pale,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusText: {
    color: C.teal,
    fontSize: 12,
    fontWeight: "700",
  },
  section: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
  },
  sectionTitle: {
    color: C.text,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 6,
  },
  sectionBody: {
    color: "#536259",
    fontSize: 13,
    lineHeight: 21,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  message: {
    color: C.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 12,
  },
  errorTitle: {
    color: C.text,
    fontSize: 21,
    fontWeight: "900",
  },
  retryButton: {
    backgroundColor: C.teal,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  retryText: {
    color: C.white,
    fontWeight: "800",
  },
  footer: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 12,
  },
});
