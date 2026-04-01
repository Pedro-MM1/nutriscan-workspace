import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../lib/firebase";
import { addMeal, MealType } from "../../lib/meals";

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

type NutritionResult = {
  nome: string;
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
  porcao: string;
};

type ScreenState = "camera" | "analyzing" | "result" | "saved";

const MEAL_TYPES: { label: string; value: MealType }[] = [
  { label: "☕️ Café", value: "breakfast" },
  { label: "🍛 Almoço", value: "lunch" },
  { label: "🍽️ Jantar", value: "dinner" },
  { label: "🍎 Lanche", value: "snack" },
];

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing] = useState<CameraType>("back");
  const [screenState, setScreenState] = useState<ScreenState>("camera");
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [result, setResult] = useState<NutritionResult | null>(null);
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [saving, setSaving] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        try {
          const cred = await signInAnonymously(auth);
          setUid(cred.user.uid);
        } catch {
          setUid(null);
        }
        return;
      }
      setUid(u.uid);
    });
    return () => unsub();
  }, []);

  const analyzeImage = async (base64: string, uri: string) => {
    setScreenState("analyzing");
    setCapturedUri(uri);

    try {
      const response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: base64,
                  },
                },
                {
                  text: `Analise esta imagem de alimento ou refeição. Retorne APENAS um objeto JSON válido, sem markdown e sem texto extra, com exatamente estes campos:
{
  "nome": "nome do alimento ou prato em português",
  "calorias": número inteiro estimado em kcal para a porção visível,
  "proteinas": número em gramas com uma casa decimal,
  "carboidratos": número em gramas com uma casa decimal,
  "gorduras": número em gramas com uma casa decimal,
  "porcao": "descrição breve da porção estimada, ex: 1 prato médio ~300g"
}`,
                },
              ],
            },
          ],
        }),
      });

      const data = await response.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      const cleaned = raw
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
      const parsed: NutritionResult = JSON.parse(cleaned);

      setResult(parsed);
      setScreenState("result");
    } catch {
      Alert.alert(
        "Não foi possível analisar",
        "Tente uma foto mais clara, com boa iluminação e o alimento centralizado."
      );
      setScreenState("camera");
    }
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({
      base64: true,
      quality: 0.7,
    });
    if (photo?.base64) {
      await analyzeImage(photo.base64, photo.uri);
    }
  };

  const handleGallery = async () => {
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      base64: true,
      quality: 0.7,
    });
    if (!picked.canceled && picked.assets[0].base64) {
      await analyzeImage(picked.assets[0].base64, picked.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!result || !uid) return;
    setSaving(true);
    try {
      await addMeal(uid, {
        name: result.nome,
        kcal: result.calorias,
        proteinG: result.proteinas,
        carbsG: result.carboidratos,
        fatG: result.gorduras,
        type: mealType,
        dateKey: new Date().toISOString().slice(0, 10),
      });
      setScreenState("saved");
    } catch {
      Alert.alert("Erro", "Não foi possível salvar a refeição. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setCapturedUri(null);
    setMealType("lunch");
    setScreenState("camera");
  };

  // ─── Permission gate ──────────────────────────────────────────
  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionIcon}>📷</Text>
        <Text style={styles.permissionTitle}>Acesso à câmera</Text>
        <Text style={styles.permissionSub}>
          Para escanear alimentos precisamos usar sua câmera.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Permitir câmera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Analyzing ───────────────────────────────────────────────
  if (screenState === "analyzing") {
    return (
      <View style={styles.analyzingContainer}>
        {capturedUri && (
          <Image source={{ uri: capturedUri }} style={styles.analyzingImage} />
        )}
        <View style={styles.analyzingOverlay}>
          <ActivityIndicator size="large" color="#60A5FA" />
          <Text style={styles.analyzingTitle}>Analisando com IA…</Text>
          <Text style={styles.analyzingSub}>
            Identificando alimento e calculando macros
          </Text>
        </View>
      </View>
    );
  }

  // ─── Result ──────────────────────────────────────────────────
  if (screenState === "result" && result) {
    return (
      <ScrollView
        style={styles.resultScroll}
        contentContainerStyle={styles.resultContent}
        showsVerticalScrollIndicator={false}
      >
        {capturedUri && (
          <Image source={{ uri: capturedUri }} style={styles.resultImage} />
        )}

        <View style={styles.resultCard}>
          <Text style={styles.resultFoodName}>{result.nome}</Text>
          <Text style={styles.resultPortion}>{result.porcao}</Text>

          <View style={styles.calorieBadge}>
            <Text style={styles.calorieValue}>{result.calorias}</Text>
            <Text style={styles.calorieUnit}>kcal</Text>
          </View>

          <View style={styles.macroRow}>
            <MacroChip label="Proteínas" value={result.proteinas} color="#60A5FA" />
            <MacroChip label="Carboidratos" value={result.carboidratos} color="#34D399" />
            <MacroChip label="Gorduras" value={result.gorduras} color="#FBBF24" />
          </View>
        </View>

        <View style={styles.mealTypeCard}>
          <Text style={styles.mealTypeTitle}>Tipo de refeição</Text>
          <View style={styles.mealTypeRow}>
            {MEAL_TYPES.map((mt) => (
              <TouchableOpacity
                key={mt.value}
                style={[
                  styles.mealTypeChip,
                  mealType === mt.value && styles.mealTypeChipActive,
                ]}
                onPress={() => setMealType(mt.value)}
              >
                <Text
                  style={[
                    styles.mealTypeChipText,
                    mealType === mt.value && styles.mealTypeChipTextActive,
                  ]}
                >
                  {mt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving || !uid}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Salvar refeição</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.retryButton} onPress={handleReset}>
          <Text style={styles.retryButtonText}>Escanear outro alimento</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ─── Saved ───────────────────────────────────────────────────
  if (screenState === "saved") {
    return (
      <View style={styles.savedContainer}>
        <Text style={styles.savedIcon}>✅</Text>
        <Text style={styles.savedTitle}>Refeição salva!</Text>
        <Text style={styles.savedSub}>
          {result?.nome} foi adicionada ao seu diário de hoje.
        </Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleReset}>
          <Text style={styles.saveButtonText}>Escanear outro alimento</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Camera ──────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        <View style={styles.cameraTopBar}>
          <Text style={styles.cameraHint}>
            Aponte para um alimento ou prato
          </Text>
        </View>

        <View style={styles.overlayFrame} />

        <View style={styles.cameraBottomBar}>
          <TouchableOpacity style={styles.galleryButton} onPress={handleGallery}>
            <Text style={styles.galleryButtonText}>🖼️</Text>
            <Text style={styles.galleryButtonLabel}>Galeria</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.captureButton} onPress={handleCapture} />

          <View style={{ width: 64 }} />
        </View>
      </CameraView>
    </View>
  );
}

function MacroChip({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={[styles.macroChip, { borderColor: color + "40" }]}>
      <Text style={[styles.macroChipValue, { color }]}>{value}g</Text>
      <Text style={styles.macroChipLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Camera ──
  camera: { flex: 1 },

  cameraTopBar: {
    paddingTop: 56,
    paddingBottom: 12,
    alignItems: "center",
  },

  cameraHint: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden",
  },

  overlayFrame: {
    flex: 1,
    margin: 44,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.7)",
  },

  cameraBottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingBottom: 48,
    paddingTop: 16,
  },

  galleryButton: {
    width: 64,
    alignItems: "center",
    gap: 4,
  },

  galleryButtonText: { fontSize: 28 },

  galleryButtonLabel: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  captureButton: {
    width: 74,
    height: 74,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.5)",
  },

  // ── Permission ──
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#F8FAFC",
  },

  permissionIcon: { fontSize: 48, marginBottom: 16 },

  permissionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 8,
  },

  permissionSub: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 20,
  },

  permissionButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },

  permissionButtonText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 15,
  },

  // ── Analyzing ──
  analyzingContainer: {
    flex: 1,
    backgroundColor: "#000",
  },

  analyzingImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
  },

  analyzingOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
  },

  analyzingTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },

  analyzingSub: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontWeight: "600",
  },

  // ── Result ──
  resultScroll: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  resultContent: {
    padding: 18,
    paddingBottom: 36,
  },

  resultImage: {
    width: "100%",
    height: 220,
    borderRadius: 20,
    marginBottom: 16,
    backgroundColor: "#E2E8F0",
  },

  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  resultFoodName: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.4,
    marginBottom: 4,
  },

  resultPortion: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 14,
  },

  calorieBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginBottom: 16,
  },

  calorieValue: {
    fontSize: 36,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -1,
  },

  calorieUnit: {
    fontSize: 16,
    fontWeight: "700",
    color: "#64748B",
  },

  macroRow: {
    flexDirection: "row",
    gap: 10,
  },

  macroChip: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
  },

  macroChipValue: {
    fontSize: 16,
    fontWeight: "900",
  },

  macroChipLabel: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "700",
    marginTop: 2,
  },

  // ── Meal type ──
  mealTypeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 14,
  },

  mealTypeTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 12,
  },

  mealTypeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  mealTypeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },

  mealTypeChipActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",
  },

  mealTypeChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },

  mealTypeChipTextActive: {
    color: "#2563EB",
  },

  // ── Buttons ──
  saveButton: {
    backgroundColor: "#22C55E",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 10,
  },

  saveButtonDisabled: {
    backgroundColor: "#A7F3D0",
  },

  saveButtonText: {
    color: "#052e16",
    fontSize: 16,
    fontWeight: "900",
  },

  retryButton: {
    paddingVertical: 14,
    alignItems: "center",
  },

  retryButtonText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "700",
  },

  // ── Saved ──
  savedContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },

  savedIcon: { fontSize: 56, marginBottom: 16 },

  savedTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 8,
  },

  savedSub: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
    fontWeight: "600",
  },
});
