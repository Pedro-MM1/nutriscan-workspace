import { LinearGradient } from "expo-linear-gradient";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";
import { auth } from "../../lib/firebase";
import { useWeightLog, WeightEntry } from "../../lib/hooks/useWeightLog";
import { useUserDoc } from "../../lib/hooks/useUserDoc";

const PERIODS = ["7 dias", "30 dias", "3 meses"];

const PERIOD_DAYS: Record<string, number> = {
  "7 dias": 7,
  "30 dias": 30,
  "3 meses": 90,
};

function dateLabel(entry: WeightEntry): string {
  const [, month, day] = entry.dateKey.split("-");
  return `${day}/${month}`;
}

function fullDate(entry: WeightEntry): string {
  const [year, month, day] = entry.dateKey.split("-");
  return `${day}/${month}/${year.slice(2)}`;
}

export default function ProgressScreen() {
  const { top } = useSafeAreaInsets();
  const [period, setPeriod] = useState("7 dias");
  const [authUid, setAuthUid] = useState<string | null>(null);

  const [androidModal, setAndroidModal] = useState(false);
  const [androidInput, setAndroidInput] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        try {
          const cred = await signInAnonymously(auth);
          setAuthUid(cred.user.uid);
        } catch {
          setAuthUid(null);
        }
        return;
      }
      setAuthUid(u.uid);
    });
    return () => unsub();
  }, []);

  const { user, data } = useUserDoc();
  const uid = user?.uid ?? authUid ?? null;

  const { entries, loading, addEntry } = useWeightLog(uid);

  const weightGoal = data?.goals?.weightGoalKg ?? 78;

  const filteredAsc = useMemo(() => {
    const days = PERIOD_DAYS[period];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    cutoff.setHours(0, 0, 0, 0);

    return [...entries]
      .filter((e) => {
        const d = typeof e.loggedAt?.toDate === "function"
          ? e.loggedAt.toDate()
          : new Date(e.dateKey);
        return d >= cutoff;
      })
      .reverse();
  }, [entries, period]);

  const chartData = useMemo(() => filteredAsc.slice(-10), [filteredAsc]);

  const current = entries[0]?.kg ?? null;
  const oldest = filteredAsc[0]?.kg ?? current;
  const diff = current != null && oldest != null
    ? (current - oldest).toFixed(1)
    : null;
  const diffPositive = diff != null && parseFloat(diff) > 0;

  const maxKg = chartData.length ? Math.max(...chartData.map((d) => d.kg)) : 0;
  const minKg = chartData.length ? Math.min(...chartData.map((d) => d.kg)) : 0;
  const range = maxKg - minKg || 1;

  const saveWeight = async (raw: string) => {
    const kg = parseFloat(raw.replace(",", "."));
    if (isNaN(kg) || kg <= 0 || kg > 500) {
      Alert.alert("Valor inválido", "Digite um peso válido em kg (ex: 81.5).");
      return;
    }
    await addEntry(kg);
  };

  const handleAddWeight = () => {
    if (Platform.OS === "ios") {
      Alert.prompt(
        "Registrar peso",
        "Digite seu peso em kg (ex: 81.5)",
        async (value) => { if (value) await saveWeight(value); },
        "plain-text",
        "",
        "decimal-pad"
      );
    } else {
      setAndroidInput("");
      setAndroidModal(true);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HERO GRADIENTE ── */}
      <LinearGradient
        colors={["#0F172A", "#1E3A5F", "#1E1B4B"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.heroGradient, { paddingTop: top + 20 }]}
      >
        <Text style={styles.heroTitle}>Progresso</Text>
        <Text style={styles.heroSubtitle}>Evolução do seu peso e metas</Text>

        {/* Cards de resumo sobre o gradiente */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Peso atual</Text>
            <Text style={[styles.summaryValue, { color: "#60A5FA" }]}>
              {current != null ? `${current} kg` : "—"}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Variação</Text>
            <Text style={[styles.summaryValue, {
              color: diff == null ? "#94A3B8" : diffPositive ? "#F87171" : "#34D399"
            }]}>
              {diff != null ? `${diffPositive ? "+" : ""}${diff} kg` : "—"}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Meta</Text>
            <Text style={[styles.summaryValue, { color: "#A78BFA" }]}>
              {weightGoal} kg
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* ── CONTEÚDO BRANCO ── */}
      <View style={styles.content}>

        {/* PERÍODO */}
        <View style={styles.periodRow}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodBtn, period === p && styles.periodBtnActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.periodLabel, period === p && styles.periodLabelActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* GRÁFICO */}
        <LinearGradient
          colors={["#0F172A", "#1E293B"]}
          style={styles.chartCard}
        >
          <Text style={styles.chartTitle}>Peso ({period})</Text>

          {loading && <ActivityIndicator color="#60A5FA" style={{ marginVertical: 24 }} />}

          {!loading && chartData.length === 0 && (
            <View style={styles.chartEmpty}>
              <Text style={styles.chartEmptyText}>Nenhum registro para este período</Text>
            </View>
          )}

          {!loading && chartData.length > 0 && (
            <View style={styles.chartArea}>
              {chartData.map((d, i) => {
                const heightPct = ((d.kg - minKg) / range) * 60 + 20;
                return (
                  <View key={d.id ?? i} style={styles.barWrap}>
                    <Text style={styles.barValue}>{d.kg}</Text>
                    <View style={[styles.bar, { height: heightPct }]} />
                    <Text style={styles.barDate}>{dateLabel(d).split("/")[0]}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </LinearGradient>

        {/* REGISTRO DE PESO */}
        <Text style={styles.sectionTitle}>Registrar peso</Text>
        <TouchableOpacity
          style={[styles.addWeightBtn, !uid && styles.addWeightBtnDisabled]}
          onPress={handleAddWeight}
          disabled={!uid}
        >
          <Text style={styles.addWeightIcon}>⚖️</Text>
          <View>
            <Text style={styles.addWeightTitle}>Adicionar medição</Text>
            <Text style={styles.addWeightSub}>Registre seu peso de hoje</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* HISTÓRICO */}
        <Text style={styles.sectionTitle}>Histórico recente</Text>

        {loading && <ActivityIndicator color="#2563EB" style={{ marginBottom: 16 }} />}

        {!loading && entries.length === 0 && (
          <View style={styles.historyEmpty}>
            <Text style={styles.historyEmptyText}>
              Nenhuma medição registrada ainda.{"\n"}Adicione seu peso acima para começar.
            </Text>
          </View>
        )}

        {!loading && entries.map((e, i) => (
          <View key={e.id} style={styles.historyItem}>
            <View>
              <Text style={styles.historyDate}>{fullDate(e)}</Text>
              <Text style={styles.historyKg}>{e.kg} kg</Text>
            </View>
            {i === 0 && (
              <View style={styles.latestBadge}>
                <Text style={styles.latestBadgeText}>Mais recente</Text>
              </View>
            )}
          </View>
        ))}

        <View style={{ height: 28 }} />
      </View>

      {/* MODAL ANDROID */}
      <Modal visible={androidModal} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior="padding"
          style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <View style={styles.androidModal}>
            <Text style={styles.androidModalTitle}>Registrar peso</Text>
            <Text style={styles.androidModalSub}>Digite seu peso em kg</Text>
            <TextInput
              style={styles.androidModalInput}
              value={androidInput}
              onChangeText={setAndroidInput}
              keyboardType="decimal-pad"
              placeholder="Ex: 81.5"
              placeholderTextColor="#94A3B8"
              autoFocus
            />
            <View style={styles.androidModalRow}>
              <TouchableOpacity
                style={styles.androidModalCancel}
                onPress={() => setAndroidModal(false)}
              >
                <Text style={styles.androidModalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.androidModalSave}
                onPress={async () => {
                  setAndroidModal(false);
                  await saveWeight(androidInput);
                }}
              >
                <Text style={styles.androidModalSaveText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#F8FAFC", paddingBottom: 32 },

  // Hero
  heroGradient: {
    paddingHorizontal: 18,
    paddingBottom: 28,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.8,
    marginBottom: 4,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 20,
  },
  summaryRow: { flexDirection: "row", gap: 10 },
  summaryCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
  },
  summaryLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  summaryValue: {
    fontSize: 17,
    fontWeight: "900",
  },

  // Conteúdo
  content: { padding: 18 },

  periodRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  periodBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 10,
    backgroundColor: "#F1F5F9", borderWidth: 1, borderColor: "#E2E8F0", alignItems: "center",
  },
  periodBtnActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  periodLabel: { fontSize: 12, fontWeight: "800", color: "#64748B" },
  periodLabelActive: { color: "#FFFFFF" },

  chartCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#0F172A",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  chartTitle: { color: "#FFFFFF", fontWeight: "900", fontSize: 14, marginBottom: 16 },
  chartArea: { flexDirection: "row", alignItems: "flex-end", gap: 6, height: 110 },
  chartEmpty: { height: 80, justifyContent: "center", alignItems: "center" },
  chartEmptyText: { color: "#4B5563", fontSize: 13, fontWeight: "600" },
  barWrap: { flex: 1, alignItems: "center", gap: 4 },
  barValue: { fontSize: 9, color: "#94A3B8", fontWeight: "700" },
  bar: { width: "100%", backgroundColor: "#60A5FA", borderRadius: 6 },
  barDate: { fontSize: 10, color: "#64748B", fontWeight: "700" },

  sectionTitle: {
    color: Colors.light.text, fontSize: 17, fontWeight: "900",
    marginBottom: 12, marginTop: 4, letterSpacing: -0.3,
  },

  addWeightBtn: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#FFFFFF", borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 16,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  addWeightBtnDisabled: { opacity: 0.5 },
  addWeightIcon: { fontSize: 22 },
  addWeightTitle: { color: Colors.light.text, fontWeight: "900", fontSize: 15 },
  addWeightSub: { color: "#64748B", fontSize: 12, fontWeight: "600", marginTop: 2 },
  chevron: { fontSize: 22, color: "#94A3B8", marginLeft: "auto" },

  historyEmpty: {
    backgroundColor: "#FFFFFF", borderRadius: 14, padding: 18,
    borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 8, alignItems: "center",
  },
  historyEmptyText: { color: "#94A3B8", fontSize: 13, fontWeight: "600", textAlign: "center", lineHeight: 20 },

  historyItem: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#FFFFFF", borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 8,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 }, elevation: 1,
  },
  historyDate: { color: "#64748B", fontSize: 12, fontWeight: "700" },
  historyKg: { color: Colors.light.text, fontWeight: "900", fontSize: 15, marginTop: 2 },
  latestBadge: { backgroundColor: "#DCFCE7", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  latestBadgeText: { color: "#166534", fontSize: 11, fontWeight: "800" },

  androidModal: {
    backgroundColor: "#FFFFFF", borderRadius: 20, padding: 24,
    width: "80%", borderWidth: 1, borderColor: "#E2E8F0",
  },
  androidModalTitle: { fontSize: 17, fontWeight: "900", color: Colors.light.text, marginBottom: 4 },
  androidModalSub: { fontSize: 13, color: "#64748B", fontWeight: "600", marginBottom: 16 },
  androidModalInput: {
    borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 16, fontWeight: "700", color: Colors.light.text,
    backgroundColor: "#F8FAFC", marginBottom: 16,
  },
  androidModalRow: { flexDirection: "row", gap: 10 },
  androidModalCancel: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    borderWidth: 1, borderColor: "#E2E8F0", alignItems: "center",
  },
  androidModalCancelText: { color: "#64748B", fontWeight: "800" },
  androidModalSave: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: "#22C55E", alignItems: "center",
  },
  androidModalSaveText: { color: "#052e16", fontWeight: "900" },
});
