import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
    Alert,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

const C = {
  teal: "#34857B",
  pale: "#E9F1F0",
  orange: "#FF6A48",
  white: "#FFFFFF",
  bg: "#F5F7F8",
  text: "#1C2B23",
  muted: "#8E9A94",
  border: "#E5EAE8",
  green: "#52A66A",
};

type AnimalStatus = "discovered" | "locked";
type CollectionFilter = "All" | "Discovered" | "Locked";
type AnimalCategory = "Mammal" | "Bird" | "Reptile";
type CategoryFilter = "All" | AnimalCategory;

const CATEGORY_COLORS: Record<
  AnimalCategory,
  { background: string; text: string; secondary: string }
> = {
  Mammal: {
    background: "#FBE5D3",
    text: "#8A4D22",
    secondary: "#A3683D",
  },
  Bird: {
    background: "#DCEAF8",
    text: "#285681",
    secondary: "#426B91",
  },
  Reptile: {
    background: "#DCEBDD",
    text: "#285D3A",
    secondary: "#42694B",
  },
};

const LOCKED_COLORS = {
  background: "#E7E9EC",
  text: "#5E646D",
  secondary: "#737982",
};

type Animal = {
  id: string;
  name: string;
  scientific: string;
  image: string;
  status: AnimalStatus;
  category: AnimalCategory;
  habitat: string;
  fact: string;
};

const ANIMALS: Animal[] = [
  {
    id: "1",
    name: "Malayan Tiger",
    scientific: "Panthera tigris jacksoni",
    image: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=600",
    status: "discovered",
    category: "Mammal",
    habitat: "Tropical forests",
    fact: "The Malayan tiger is a powerful predator native to the Malay Peninsula.",
  },
  {
    id: "2",
    name: "Asian Elephant",
    scientific: "Elephas maximus",
    image: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=600",
    status: "discovered",
    category: "Mammal",
    habitat: "Forests and grasslands",
    fact: "Asian elephants are intelligent, social animals that live in family groups.",
  },
  {
    id: "3",
    name: "Orangutan",
    scientific: "Pongo pygmaeus",
    image: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=600",
    status: "discovered",
    category: "Mammal",
    habitat: "Tropical rainforests",
    fact: "Orangutans are great apes known for their intelligence and tree-dwelling lifestyle.",
  },
  {
    id: "4",
    name: "Red Panda",
    scientific: "Ailurus fulgens",
    image: "https://images.unsplash.com/photo-1497752531616-c3afd9760a11?w=600",
    status: "locked",
    category: "Mammal",
    habitat: "Mountain forests",
    fact: "Red pandas spend much of their time in trees and mainly eat bamboo.",
  },
  {
    id: "5",
    name: "Giraffe",
    scientific: "Giraffa camelopardalis",
    image: "https://images.unsplash.com/photo-1547721064-da6cfb341d50?w=600",
    status: "locked",
    category: "Mammal",
    habitat: "African savannas",
    fact: "Giraffes are the tallest land animals and use their long tongues to feed on leaves.",
  },
  {
    id: "6",
    name: "Lion",
    scientific: "Panthera leo",
    image: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=600",
    status: "locked",
    category: "Mammal",
    habitat: "Grasslands and savannas",
    fact: "Lions are social big cats that often live in groups called prides.",
  },
  {
    id: "7",
    name: "Flamingo",
    scientific: "Phoenicopterus roseus",
    image: "https://images.unsplash.com/photo-1497206365907-f5e630693df0?w=600",
    status: "locked",
    category: "Bird",
    habitat: "Wetlands and lagoons",
    fact: "Flamingos are wading birds recognised by their long legs and pink feathers.",
  },
  {
    id: "8",
    name: "Sea Turtle",
    scientific: "Chelonia mydas",
    image: "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=600",
    status: "locked",
    category: "Reptile",
    habitat: "Tropical oceans",
    fact: "Sea turtles spend most of their lives in the ocean and return to beaches to nest.",
  },
];

const FILTERS: CollectionFilter[] = ["All", "Discovered", "Locked"];

export default function ZooDexScreen() {
  const [activeFilter, setActiveFilter] = useState<CollectionFilter>("All");

  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");

  const [searchQuery, setSearchQuery] = useState("");

  const discoveredCount = ANIMALS.filter(
    (animal) => animal.status === "discovered",
  ).length;

  const filteredAnimals = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return ANIMALS.filter((animal) => {
      const matchesStatus =
        activeFilter === "All" || animal.status === activeFilter.toLowerCase();

      const matchesCategory =
        activeCategory === "All" || animal.category === activeCategory;

      const matchesSearch =
        query.length === 0 ||
        animal.name.toLowerCase().includes(query) ||
        animal.scientific.toLowerCase().includes(query);

      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [activeFilter, activeCategory, searchQuery]);

  const handleAnimalPress = (animal: Animal) => {
    if (animal.status === "locked") {
      Alert.alert(
        "Animal Locked",
        "Discover this animal by scanning its QR code or using the animal scanner.",
        [{ text: "Got it" }],
      );

      return;
    }

    Alert.alert(
      animal.name,
      `${animal.scientific}\n\n${animal.fact}\n\nHabitat: ${animal.habitat}`,
      [{ text: "Close" }],
    );
  };

  return (
    <View style={s.container}>
      {/* Teal header */}
      <View style={s.hero}>
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>YOUR COLLECTION</Text>
            <Text style={s.headerTitle}>My ZooDex</Text>
            <Text style={s.headerSubtitle}>
              Your wildlife discovery journey
            </Text>
          </View>

          <View style={s.headerIcon}>
            <Ionicons name="book-outline" size={27} color={C.teal} />
          </View>
        </View>

        {/* Collection progress */}
        <View style={s.progressCard}>
          <View style={s.progressTop}>
            <View>
              <Text style={s.progressLabel}>Collection progress</Text>

              <Text style={s.progressCount}>
                {discoveredCount} / {ANIMALS.length}
              </Text>

              <Text style={s.progressMessage}>Animals discovered!</Text>
            </View>

            <View style={s.progressIcon}>
              <Ionicons name="paw" size={32} color={C.teal} />
            </View>
          </View>

          <View style={s.progressTrack}>
            <View
              style={[
                s.progressFill,
                {
                  width: `${(discoveredCount / ANIMALS.length) * 100}%`,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Animal collection */}
      <View style={s.collectionContent}>
        {/* Search bar */}
        <View style={s.searchContainer}>
          <Ionicons name="search-outline" size={20} color={C.muted} />

          <TextInput
            style={s.searchInput}
            placeholder="Search animal or scientific name..."
            placeholderTextColor={C.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />

          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={C.muted} />
            </Pressable>
          )}
        </View>

        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Animal Collection</Text>

          <Text style={s.animalCount}>{filteredAnimals.length} animals</Text>
        </View>

        {/* Collection filters */}
        <View style={s.filterContainer}>
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;

            return (
              <Pressable
                key={filter}
                onPress={() => setActiveFilter(filter)}
                style={[s.filterButton, isActive && s.activeFilterButton]}
              >
                <Text style={[s.filterText, isActive && s.activeFilterText]}>
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Category filters */}
        <Text style={s.categoryLabel}>Category</Text>

        <View style={s.categoryFilterContainer}>
          {(["All", "Mammal", "Bird", "Reptile"] as CategoryFilter[]).map(
            (category) => {
              const isActive = activeCategory === category;

              return (
                <Pressable
                  key={category}
                  onPress={() => setActiveCategory(category)}
                  style={[
                    s.categoryFilterButton,
                    isActive && s.activeCategoryFilterButton,
                  ]}
                >
                  <Text
                    style={[
                      s.categoryFilterText,
                      isActive && s.activeCategoryFilterText,
                    ]}
                  >
                    {category === "All" ? "All Categories" : category}
                  </Text>
                </Pressable>
              );
            },
          )}
        </View>

        {/* Animal cards */}
        <View style={s.animalGrid}>
          {filteredAnimals.map((animal) => {
            const isDiscovered = animal.status === "discovered";

            const colors =
              animal.status === "discovered"
                ? CATEGORY_COLORS[animal.category]
                : LOCKED_COLORS;

            return (
              <Pressable
                key={animal.id}
                onPress={() => handleAnimalPress(animal)}
                style={({ pressed }) => [
                  s.animalCard,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.background,
                  },
                  pressed && s.pressedCard,
                ]}
              >
                <View style={s.imageContainer}>
                  <Image
                    source={{ uri: animal.image }}
                    style={[s.animalImage, !isDiscovered && s.lockedImage]}
                    resizeMode="cover"
                  />

                  {!isDiscovered && (
                    <View style={s.lockOverlay}>
                      <Ionicons name="lock-closed" size={25} color={C.white} />
                    </View>
                  )}

                  {isDiscovered && (
                    <View style={s.discoveredBadge}>
                      <Ionicons name="checkmark" size={14} color={C.white} />
                    </View>
                  )}
                </View>

                <View style={s.animalInfo}>
                  <Text
                    style={[s.animalName, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {isDiscovered ? animal.name : "Unknown Animal"}
                  </Text>

                  <Text
                    style={[
                      s.animalStatus,
                      {
                        color: colors.secondary,
                        fontStyle: "italic",
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {isDiscovered ? animal.scientific : "Scan to unlock"}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={s.bottomSpacing} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: C.bg,
  },
  hero: {
    backgroundColor: C.teal,
    paddingTop: 20,
    paddingHorizontal: 22,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },
  greeting: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 4,
  },
  headerTitle: {
    color: C.white,
    fontSize: 28,
    fontWeight: "900",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    marginTop: 5,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.pale,
    alignItems: "center",
    justifyContent: "center",
  },
  progressCard: {
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  progressTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  progressLabel: {
    color: C.muted,
    fontSize: 13,
  },
  progressCount: {
    color: C.text,
    fontSize: 29,
    fontWeight: "900",
    marginTop: 5,
  },
  progressMessage: {
    color: C.teal,
    fontSize: 12,
    marginTop: 3,
  },
  progressIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: C.pale,
    alignItems: "center",
    justifyContent: "center",
  },
  progressTrack: {
    height: 8,
    backgroundColor: "#E8EFEC",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: C.teal,
    borderRadius: 4,
  },
  collectionContent: {
    paddingHorizontal: 22,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  sectionTitle: {
    color: C.text,
    fontSize: 19,
    fontWeight: "900",
  },
  animalCount: {
    color: C.muted,
    fontSize: 12,
  },
  filterContainer: {
    flexDirection: "row",
    gap: 9,
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 17,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
  },
  activeFilterButton: {
    backgroundColor: C.teal,
    borderColor: C.teal,
  },
  filterText: {
    color: "#52645C",
    fontSize: 12,
    fontWeight: "700",
  },
  activeFilterText: {
    color: C.white,
  },
  animalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
    marginBottom: 18,
  },
  searchInput: {
    flex: 1,
    color: C.text,
    fontSize: 13,
    paddingVertical: 0,
  },
  categoryLabel: {
    color: C.text,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 10,
  },
  categoryFilterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  categoryFilterButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
  },
  activeCategoryFilterButton: {
    backgroundColor: C.pale,
    borderColor: C.teal,
  },
  categoryFilterText: {
    color: "#52645C",
    fontSize: 12,
    fontWeight: "700",
  },
  activeCategoryFilterText: {
    color: C.teal,
  },
  animalCard: {
    width: "48%",
    backgroundColor: C.white,
    borderRadius: 15,
    padding: 9,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: C.green,
  },
  pressedCard: {
    opacity: 0.8,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: C.pale,
  },
  animalImage: {
    width: "100%",
    height: "100%",
  },
  lockedImage: {
    opacity: 0.45,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(28,43,35,0.15)",
  },
  discoveredBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: C.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  animalInfo: {
    paddingHorizontal: 3,
    paddingTop: 11,
    paddingBottom: 5,
  },
  animalName: {
    color: C.text,
    fontSize: 13,
    fontWeight: "800",
  },
  lockedText: {
    color: C.muted,
  },
  animalStatus: {
    color: C.teal,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 5,
  },
  bottomSpacing: {
    height: 25,
  },
});
