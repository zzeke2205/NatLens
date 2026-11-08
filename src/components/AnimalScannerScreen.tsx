import { discoverSpeciesFromQR } from "@/lib/speciesDiscovery";
import { useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import AnimalScanner from "./AnimalScanner";

type AnimalScannerScreenProps = {
  onBack: () => void;
  onOpenZooDex: () => void;
};

export default function AnimalScannerScreen({
  onBack,
  onOpenZooDex,
}: AnimalScannerScreenProps) {
  const [qrScannerActive, setQrScannerActive] = useState(false);
  const [discoveredSpecies, setDiscoveredSpecies] = useState<any>(null);
  const [isAlreadyDiscovered, setIsAlreadyDiscovered] = useState(false);

  const handleQRCodeScanned = async (data: string) => {
    setQrScannerActive(false);

    try {
      const result = await discoverSpeciesFromQR(data);

      setDiscoveredSpecies(result.species);
      setIsAlreadyDiscovered(result.status === "already_discovered");
    } catch (error: any) {
      console.error("Species discovery error:", error);

      const message =
        error?.message ||
        error?.details ||
        error?.hint ||
        JSON.stringify(error) ||
        "Unknown error occurred.";

      Alert.alert("Scan Failed", message, [
        {
          text: "Try Again",
          onPress: () => setQrScannerActive(true),
        },
        {
          text: "Cancel",
        },
      ]);
    }
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.back}>
        <Text style={styles.backText}>‹ Back</Text>
      </TouchableOpacity>

      <View style={styles.heading}>
        <Text style={styles.title}>Scan an Animal</Text>
        <Text style={styles.subtitle}>
          Choose how you want to discover wildlife.
        </Text>
      </View>

      {discoveredSpecies ? (
        <View style={styles.discoveryCard}>
          <Text style={styles.discoveryIcon}>
            {isAlreadyDiscovered ? "📖" : "🎉"}
          </Text>

          <Text style={styles.discoveryTitle}>
            {isAlreadyDiscovered ? "Already Discovered!" : "Animal Discovered!"}
          </Text>

          {discoveredSpecies.cover_image_url ? (
            <Image
              source={{ uri: discoveredSpecies.cover_image_url }}
              style={styles.animalImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>🐘</Text>
            </View>
          )}

          <Text style={styles.animalName}>{discoveredSpecies.common_name}</Text>

          <Text style={styles.scientificName}>
            {discoveredSpecies.scientific_name}
          </Text>

          <Text style={styles.discoveryDescription}>
            {isAlreadyDiscovered
              ? "This animal is already part of your ZooDex collection."
              : "Congratulations! This animal has been added to your ZooDex collection."}
          </Text>

          {discoveredSpecies.description ? (
            <Text style={styles.animalDescription}>
              {discoveredSpecies.description}
            </Text>
          ) : null}

          <TouchableOpacity style={styles.zooDexButton} onPress={onOpenZooDex}>
            <Text style={styles.zooDexButtonText}>View My ZooDex</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.scanAgainButton}
            onPress={() => setDiscoveredSpecies(null)}
          >
            <Text style={styles.scanAgainText}>Discover Another Animal</Text>
          </TouchableOpacity>
        </View>
      ) : qrScannerActive ? (
        <AnimalScanner
          onCancel={() => setQrScannerActive(false)}
          onQRCodeScanned={handleQRCodeScanned}
        />
      ) : (
        <>
          <View style={styles.placeholder}>
            <Text style={styles.cameraIcon}>📷</Text>

            <Text style={styles.cardTitle}>Ready for your next discovery?</Text>

            <Text style={styles.description}>
              Scan an animal's QR code to add it to your ZooDex collection.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => setQrScannerActive(true)}
          >
            <Text style={styles.menuIcon}>▦</Text>

            <View style={styles.menuContent}>
              <Text style={styles.cardTitle}>Scan QR Code</Text>
              <Text style={styles.menuDescription}>
                Scan an animal's exhibit code
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() =>
              Alert.alert(
                "AI recognition",
                "AI image recognition is not connected yet.",
              )
            }
          >
            <Text style={styles.menuIcon}>✨</Text>

            <View style={styles.menuContent}>
              <Text style={styles.cardTitle}>Identify with Camera</Text>
              <Text style={styles.menuDescription}>
                Identify an animal using AI recognition
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.zooDexButton} onPress={onOpenZooDex}>
            <Text style={styles.zooDexButtonText}>View My ZooDex</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F7FAF8",
  },
  container: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  back: {
    alignSelf: "flex-start",
    paddingVertical: 8,
  },
  backText: {
    color: "#34857B",
    fontSize: 16,
    fontWeight: "700",
  },
  heading: {
    gap: 6,
    marginBottom: 8,
  },
  title: {
    color: "#1C2B23",
    fontSize: 26,
    fontWeight: "800",
  },
  subtitle: {
    color: "#8E9A94",
    fontSize: 14,
  },
  placeholder: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#E5EAE8",
  },
  cameraIcon: {
    fontSize: 54,
  },
  cardTitle: {
    color: "#1C2B23",
    fontSize: 16,
    fontWeight: "800",
  },
  description: {
    color: "#8E9A94",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  menuRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: "#E5EAE8",
  },
  menuIcon: {
    fontSize: 25,
  },
  menuContent: {
    flex: 1,
    gap: 5,
  },
  menuDescription: {
    color: "#8E9A94",
    fontSize: 12,
  },
  arrow: {
    color: "#34857B",
    fontSize: 25,
  },
  zooDexButton: {
    backgroundColor: "#34857B",
    padding: 16,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 4,
    width: "100%",
  },
  zooDexButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  discoveryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: "#E5EAE8",
  },
  discoveryIcon: {
    fontSize: 42,
  },
  discoveryTitle: {
    color: "#1C2B23",
    fontSize: 23,
    fontWeight: "800",
    textAlign: "center",
  },
  animalImage: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    backgroundColor: "#E5EAE8",
  },
  imagePlaceholder: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    backgroundColor: "#E5EAE8",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 65,
  },
  animalName: {
    color: "#1C2B23",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  scientificName: {
    color: "#8E9A94",
    fontSize: 14,
    fontStyle: "italic",
  },
  discoveryDescription: {
    color: "#68766F",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
  },
  animalDescription: {
    color: "#68766F",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  scanAgainButton: {
    padding: 12,
  },
  scanAgainText: {
    color: "#34857B",
    fontSize: 14,
    fontWeight: "700",
  },
});
