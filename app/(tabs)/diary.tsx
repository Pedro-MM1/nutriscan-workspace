import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AddMealModal from "../../components/AddMealModal";
import { Colors } from "../../constants/Colors";
import { auth } from "../../lib/firebase";
import { useDailyMeals } from "../../lib/hooks/useDailyMeals";
import { useUserDoc } from "../../lib/hooks/useUserDoc";
import { addMeal } from "../../lib/meals";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

const MEAL_CONFIG: Record<MealType, { label: string; emoji: string; color: string; bg: string }> = {
  breakfast: { label: "Café da manhã", emoji: "☕️", color: "#D97706", bg: "#FEF3C7" },
  lunch:     { label: "Almoço",        emoji: "🍛", color: "#0369A1", bg: "#E0F2FE" },
  dinner:    { label: "Jantar",        emoji: "🍽️", color: "#7C3AED", bg: "#EDE9FE" },
  snack:     { label: "Lanche",        emoji: "🍎", color: "#166534", bg: "#DCFCE7" },
};

function buildDates() {
  const today = new Date();
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const label =
      i === 0 ? "Hoje" :
      i === 1 ? "Ontem" :
      `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    return { label, date: d };
  });
}

function formatTime(createdAt: any): string {
  if (!createdAt) return "";
  const d =
    typeof createdAt?.toDate === "function"
      ? createdAt.toDate()
      : createdAt instanceof Date
      ? createdAt
      : null;
  if (!d) return "";
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function DiaryScreen() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [authUid, setAuthUid] = useState<string | null>(null);

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

  // Array de datas computado uma vez no mount
  const DATES = useMemo(() => buildDates(), []);
  const selectedDate = DATES[selectedIndex].date;

  const { meals, totals, loading } = useDailyMeals(uid, selectedDate);

  const dailyGoal = data?.goals?.kcal ?? 2200;
  const remaining = Math.max(dailyGoal - totals.calories, 0);
  const pct = Math.min(Math.round((totals.calories / dailyGoal) * 100), 100);

  const grouped = (["breakfast", "lunch", "dinner", "snack"] as MealType[]).map((type) => ({
    type,
    items: meals.filter((m) => m.type === type),
  }));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Diário alimentar</Text>
        <Text style={styles.subtitle}>Tudo que você comeu hoje</Text>
      </View>

      {/* SELETOR DE DATA */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 16 }}
        contentContainerStyle={{ gap: 8, paddingRight: 8 }}
      >
        {DATES.map((d, i) => (
          <TouchableOpacity
            key={d.label}
            style={[styles.dateChip, selectedIndex === i && styles.dateChipActive]}
            onPress={() => setSelectedIndex(i)}
          >
            <Text style={[styles.dateChipLabel, selectedIndex === i && styles.dateChipLabelActive]}>
              {d.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* RESUMO DO DIA */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <View>
            <Text style={styles.summaryKcal}>{totals.calories} kcal</Text>
            <Text style={styles.summaryMeta}>
              Meta {dailyGoal} kcal • Restam {remaining} kcal
            </Text>
          </View>
          <View style={styles.pctBadge}>
            <Text style={styles.pctBadgeText}>{pct}%</Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>

        <View style={styles.macroRow}>
          <MacroChip label="Prot." value={`${totals.protein}g`} color="#2563EB" />
          <MacroChip label="Carb." value={`${totals.carbs}g`}   color="#D97706" />
          <MacroChip label="Gord." value={`${totals.fat}g`}     color="#DC2626" />
        </View>
      </View>

      {/* LOADING */}
      {loading && (
        <ActivityIndicator color="#2563EB" style={{ marginVertical: 24 }} />
      )}

      {/* EMPTY STATE */}
      {!loading && meals.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🍽️</Text>
          <Text style={styles.emptyTitle}>Nenhuma refeição registrada</Text>
          <Text style={styles.emptySub}>
            {selectedIndex === 0
              ? "Adicione uma refeição abaixo ou use o Scanner."
              : "Não há registros para este dia."}
          </Text>
        </View>
      )}

      {/* REFEIÇÕES POR TIPO */}
      {!loading && grouped.map(({ type, items }) => {
        if (items.length === 0) return null;
        const cfg = MEAL_CONFIG[type];
        const typeKcal = items.reduce((s, m) => s + (m.totals?.calories ?? 0), 0);

        return (
          <View key={type} style={{ marginBottom: 6 }}>
            <View style={styles.groupHeader}>
              <View style={[styles.groupEmoji, { backgroundColor: cfg.bg }]}>
                <Text style={{ fontSize: 16 }}>{cfg.emoji}</Text>
              </View>
              <Text style={styles.groupLabel}>{cfg.label}</Text>
              <Text style={[styles.groupKcal, { color: cfg.color }]}>{typeKcal} kcal</Text>
            </View>

            <View style={styles.itemsWrap}>
              {items.map((m) => {
                const time = formatTime(m.createdAt);
                return (
                  <View key={m.id} style={styles.mealItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.mealName}>{m.name}</Text>
                      <Text style={styles.mealMacros}>
                        P {m.totals?.protein ?? 0}g • C {m.totals?.carbs ?? 0}g • G {m.totals?.fat ?? 0}g
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={styles.mealKcal}>{m.totals?.calories ?? 0} kcal</Text>
                      {time ? <Text style={styles.mealTime}>{time}</Text> : null}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}

      {/* ADICIONAR REFEIÇÃO */}
      <TouchableOpacity
        style={[styles.addBtn, !uid && styles.addBtnDisabled]}
        onPress={() => setAddOpen(true)}
        disabled={!uid}
      >
        <Text style={styles.addBtnText}>➕ Adicionar refeição</Text>
      </TouchableOpacity>

      <View style={{ height: 28 }} />

      <AddMealModal
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={async (meal) => {
          if (!uid) return;
          await addMeal(uid, {
            ...meal,
            type: meal.type ?? "lunch",
            dateKey: selectedDate.toISOString().slice(0, 10),
          });
          setAddOpen(false);
        }}
      />
    </ScrollView>
  );
}

function MacroChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.macroChip}>
      <Text style={[styles.macroChipLabel, { color }]}>{label}</Text>
      <Text style={styles.macroChipValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, paddingBottom: 32, backgroundColor: "#F8FAFC" },

  header: { marginTop: 6, marginBottom: 18 },
  title: { fontSize: 28, fontWeight: "900", color: Colors.light.text, letterSpacing: -0.8 },
  subtitle: { color: "#64748B", fontSize: 14, marginTop: 6, fontWeight: "600" },

  dateChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999,
    backgroundColor: "#F1F5F9", borderWidth: 1, borderColor: "#E2E8F0",
  },
  dateChipActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  dateChipLabel: { fontSize: 13, fontWeight: "800", color: "#64748B" },
  dateChipLabelActive: { color: "#FFFFFF" },

  summaryCard: {
    backgroundColor: "#FFFFFF", borderRadius: 22, padding: 18,
    borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 20,
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 }, elevation: 4,
  },
  summaryTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  summaryKcal: { fontSize: 30, fontWeight: "900", color: Colors.light.text, letterSpacing: -0.8 },
  summaryMeta: { color: "#64748B", fontSize: 12, marginTop: 4, fontWeight: "600" },
  pctBadge: {
    backgroundColor: "#DCFCE7", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6,
  },
  pctBadgeText: { color: "#166534", fontWeight: "900", fontSize: 15 },

  progressTrack: {
    height: 8, backgroundColor: "#E2E8F0", borderRadius: 999, overflow: "hidden",
    borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 14,
  },
  progressFill: { height: "100%", backgroundColor: "#22C55E", borderRadius: 999 },

  macroRow: { flexDirection: "row", gap: 8 },
  macroChip: {
    flex: 1, backgroundColor: "#F8FAFC", borderRadius: 12, padding: 10,
    borderWidth: 1, borderColor: "#E2E8F0", alignItems: "center",
  },
  macroChipLabel: { fontSize: 11, fontWeight: "800", marginBottom: 2 },
  macroChipValue: { fontSize: 14, fontWeight: "900", color: Colors.light.text },

  emptyState: {
    alignItems: "center", paddingVertical: 32, paddingHorizontal: 24,
    backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1,
    borderColor: "#E2E8F0", marginBottom: 16,
  },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "900", color: Colors.light.text, marginBottom: 6 },
  emptySub: { fontSize: 13, color: "#64748B", fontWeight: "600", textAlign: "center", lineHeight: 20 },

  groupHeader: {
    flexDirection: "row", alignItems: "center", gap: 10,
    marginBottom: 8, marginTop: 4,
  },
  groupEmoji: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  groupLabel: { flex: 1, fontWeight: "900", fontSize: 15, color: Colors.light.text },
  groupKcal: { fontSize: 13, fontWeight: "800" },

  itemsWrap: { gap: 8, marginBottom: 12 },
  mealItem: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFFFFF", borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: "#E2E8F0",
  },
  mealName: { fontSize: 14, fontWeight: "900", color: Colors.light.text, marginBottom: 3 },
  mealMacros: { fontSize: 12, color: "#64748B", fontWeight: "600" },
  mealKcal: { fontSize: 14, fontWeight: "900", color: "#16A34A" },
  mealTime: { fontSize: 11, color: "#94A3B8", fontWeight: "700", marginTop: 2 },

  addBtn: {
    marginTop: 8, backgroundColor: "#22C55E", borderRadius: 18,
    paddingVertical: 16, alignItems: "center",
  },
  addBtnDisabled: { backgroundColor: "#A7F3D0" },
  addBtnText: { color: "#022C22", fontWeight: "900", fontSize: 15 },
});
