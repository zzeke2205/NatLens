import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
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

const TABS = ["Overview", "Habitat & Diet", "Biology", "Conservation"];

export default function AnimalInfoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();

  const pagerRef = useRef<ScrollView>(null);

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);

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
        setActiveTab(0);
      }

      setLoading(false);
    }

    loadAnimal();

    return () => {
      active = false;
    };
  }, [id]);

  function selectTab(index: number) {
    setActiveTab(index);
    pagerRef.current?.scrollTo({
      x: index * width,
      animated: true,
    });
  }

  function handlePageChange(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const page = Math.round(event.nativeEvent.contentOffset.x / width);

    setActiveTab(Math.max(0, Math.min(page, TABS.length - 1)));
  }

  return (
    <View style={styles.screen}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
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
        <>
          <View style={styles.hero}>
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

            <View style={styles.heroDetails}>
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
            </View>
          </View>

          <View style={styles.tabBar}>
            {TABS.map((tab, index) => {
              const selected = activeTab === index;

              return (
                <TouchableOpacity
                  key={tab}
                  style={styles.tab}
                  onPress={() => selectTab(index)}
                  accessibilityRole="tab"
                  accessibilityState={{
                    selected,
                  }}
                >
                  <Text
                    style={[styles.tabText, selected && styles.activeTabText]}
                    numberOfLines={2}
                  >
                    {tab}
                  </Text>

                  {selected ? <View style={styles.tabIndicator} /> : null}
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView
            ref={pagerRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handlePageChange}
            style={styles.pager}
            contentContainerStyle={styles.pagerContent}
            nestedScrollEnabled
          >
            {/* TAB 1: OVERVIEW */}
            <ScrollView
              key={`${animal.id}-overview`}
              style={{ width }}
              contentContainerStyle={styles.pageContent}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
            >
              <Text style={styles.pageTitle}>About this animal</Text>

              <InfoSection title="Introduction" value={animal.description} />

              {!animal.description?.trim() ? (
                <EmptyMessage message="An introduction for this animal has not been added yet." />
              ) : null}

              <Text style={styles.footer}>
                Discover wildlife and learn about biodiversity.
              </Text>
            </ScrollView>

            {/* TAB 2: HABITAT & DIET */}
            <ScrollView
              key={`${animal.id}-habitat`}
              style={{ width }}
              contentContainerStyle={styles.pageContent}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
            >
              <Text style={styles.pageTitle}>Habitat & Diet</Text>

              {!animal.habitat?.trim() && !animal.diet?.trim() ? (
                <EmptyMessage message="Habitat and diet information has not been added yet." />
              ) : (
                <>
                  <InfoSection title="Natural habitat" value={animal.habitat} />

                  <InfoSection title="Diet" value={animal.diet} />
                </>
              )}
            </ScrollView>

            {/* TAB 3: BIOLOGY */}
            <ScrollView
              key={`${animal.id}-biology`}
              style={{ width }}
              contentContainerStyle={styles.pageContent}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
            >
              <Text style={styles.pageTitle}>Physical characteristics</Text>

              {!animal.average_height?.trim() &&
              !animal.average_weight?.trim() ? (
                <EmptyMessage message="Physical measurements have not been added yet." />
              ) : (
                <>
                  <InfoSection
                    title="Average height"
                    value={animal.average_height}
                  />

                  <InfoSection
                    title="Average weight"
                    value={animal.average_weight}
                  />
                </>
              )}
            </ScrollView>

            {/* TAB 4: CONSERVATION */}
            <ScrollView
              key={`${animal.id}-conservation`}
              style={{ width }}
              contentContainerStyle={styles.pageContent}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
            >
              <Text style={styles.pageTitle}>Conservation</Text>

              {animal.conservation_status?.trim() ? (
                <InfoSection
                  title="Conservation status"
                  value={animal.conservation_status}
                />
              ) : (
                <EmptyMessage message="The conservation status has not been added yet." />
              )}

              <Text style={styles.conservationNote}>
                Understanding the conservation status of wildlife helps us learn
                about biodiversity and the importance of protecting animal
                species.
              </Text>
            </ScrollView>
          </ScrollView>
        </>
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

function EmptyMessage({ message }: { message: string }) {
  return (
    <View style={styles.emptyBox}>
      <Text style={styles.emptyText}>{message}</Text>
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
    paddingVertical: 12,
  },
  backText: {
    color: C.teal,
    fontSize: 16,
    fontWeight: "800",
  },
  hero: {
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  image: {
    width: "100%",
    height: 210,
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
  heroDetails: {
    paddingHorizontal: 22,
    paddingTop: 17,
    paddingBottom: 16,
  },
  eyebrow: {
    color: C.orange,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 5,
  },
  title: {
    color: C.text,
    fontSize: 27,
    fontWeight: "900",
    marginBottom: 4,
  },
  scientific: {
    color: C.muted,
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 12,
  },
  statusChip: {
    alignSelf: "flex-start",
    backgroundColor: C.pale,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statusText: {
    color: C.teal,
    fontSize: 12,
    fontWeight: "700",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tab: {
    flex: 1,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
    paddingTop: 8,
    position: "relative",
  },
  tabText: {
    color: C.muted,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
  activeTabText: {
    color: C.teal,
    fontWeight: "900",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 5,
    right: 5,
    height: 3,
    backgroundColor: C.teal,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  pager: {
    flex: 1,
  },
  pagerContent: {
    alignItems: "stretch",
  },
  pageContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },
  pageTitle: {
    color: C.text,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 15,
  },
  section: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    color: C.text,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 7,
  },
  sectionBody: {
    color: "#536259",
    fontSize: 14,
    lineHeight: 22,
  },
  emptyBox: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
  },
  conservationNote: {
    color: "#536259",
    fontSize: 13,
    lineHeight: 21,
    marginTop: 5,
    marginHorizontal: 2,
  },
  footer: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 12,
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
});
