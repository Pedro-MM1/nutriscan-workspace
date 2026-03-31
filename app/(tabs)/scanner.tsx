import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Precisamos acessar sua câmera</Text>

        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Permitir câmera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing}>
        <View style={styles.overlay} />

        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.captureButton} />
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  camera: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    borderColor: "#FFFFFF",
    borderWidth: 2,
    margin: 40,
    borderRadius: 20,
  },

  bottomBar: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    alignItems: "center",
  },

  captureButton: {
    width: 74,
    height: 74,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 4,
    borderColor: "#E2E8F0",
  },

  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  permissionText: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 20,
  },

  permissionButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },

  permissionButtonText: {
    color: "#FFF",
    fontWeight: "800",
  },
});