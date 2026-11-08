import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

type AnimalScannerProps = {
  onCancel: () => void;
  onQRCodeScanned: (data: string) => void;
};

export default function AnimalScanner({
  onCancel,
  onQRCodeScanned,
}: AnimalScannerProps) {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const [hasScanned, setHasScanned] = useState(false);

  const handlePermissionRequest = async () => {
    const permission = await requestCameraPermission();

    if (!permission.granted) {
      Alert.alert(
        "Camera Permission Required",
        "Please allow camera access to scan animal QR codes.",
      );
    }
  };

  if (!cameraPermission) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Checking camera permissions...</Text>
      </View>
    );
  }

  if (!cameraPermission.granted) {
    return (
      <View style={{ padding: 20, alignItems: "center" }}>
        <Text style={{ marginBottom: 15 }}>
          Camera permission is required to scan animal QR codes.
        </Text>

        <TouchableOpacity
          onPress={handlePermissionRequest}
          style={{
            backgroundColor: "#34857B",
            padding: 14,
            borderRadius: 12,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>
            Allow Camera Access
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onCancel}>
          <Text style={{ color: "#34857B" }}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      <View
        style={{
          height: 380,
          overflow: "hidden",
          borderRadius: 20,
          backgroundColor: "#000000",
        }}
      >
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={
            hasScanned
              ? undefined
              : (result) => {
                  setHasScanned(true);
                  onQRCodeScanned(result.data);
                }
          }
        />
      </View>

      <Text
        style={{
          color: "#8E9A94",
          fontSize: 13,
          textAlign: "center",
          lineHeight: 20,
        }}
      >
        Position the animal's QR code inside the camera view.
      </Text>

      <TouchableOpacity
        onPress={onCancel}
        style={{
          backgroundColor: "#FFFFFF",
          padding: 14,
          borderRadius: 15,
          borderWidth: 1,
          borderColor: "#E5EAE8",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#1C2B23", fontWeight: "800" }}>
          Cancel scanning
        </Text>
      </TouchableOpacity>
    </View>
  );
}
