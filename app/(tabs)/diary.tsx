import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/Colors";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

interface Meal {
  id: string;
  name: string;
  type: MealType;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  time: string;
}

const MEALS: Meal[] = [
  { id: "1", name: "Ovos mexidos + pão integral", type: "breakfast", kcal: 380, proteinG: 22, carbsG: 34, fatG: 14, time: "07:30" },
  { id: "2", name: "Iogurte grego com granola",   type: "snack",     kcal: 210, proteinG: 14, carbsG: 26, fatG: 5,  time: "10:00" },
  { id: "3", name: "Frango grelhado com arroz",   type: "lunch",     kcal: 620, proteinG: 48, carbsG: 58, fatG: 12, time: "12:30" },
  { id: "4", name: "Whey protein + banana",        type: "snack",     kcal: 290, proteinG: 30, carbsG: 32, fatG: 4,  time: "16:00" },
  { id: "5", name: "Salmão com batata doce",       type: "dinner",    kcal: 540, proteinG: 42, carbsG: 44, fatG: 16, time: "19:30" },
];

const MEAL_CONFIG: Record<MealType, { label: string; emoji: string; color: string; bg: string }> = {
  breakfast: { label: "Café da manhã", emoji: "☕️", color: "#D97706", bg: "#FEF3C7" },
  lunch:     { label: "Almoço",        emoji: "🍛", color: "#0369A1", bg: "#E0F2FE" },
  dinner:    { label: "Jantar",        emoji: "🍽️", color: "#7C3AED", bg: "#EDE9FE" },
  snack:     { label: "Lanche",        emoji: "🍎", color: "#166534", bg: "#DCFCE7" },
};

const DATES = ["Hoje", "Ontem", "28/03", "27/03", "26/03"];

export default function DiaryScreen() {
  const [selectedDate, setSelectedDate] = useState("Hoje");

  const totals = MEALS.reduce(
    (acc, m) => ({
      kcal: acc.kcal + m.kcal,
      protein: acc.protein + m.proteinG,
      carbs: acc.carbs + m.carbsG,
      fat: acc.fat + m.fatG,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const dailyGoal = 2200;
  const remaining = Math.max(dailyGoal - totals.kcal, 0);
  const pct = Math.min(Math.round((totals.kcal / dailyGoal) * 100), 100);

  const grouped = (["breakfast", "lunch", "dinner", "snack"] as MealType[]).map((type) => ({
    type,
    items: MEALS.filter((m) => m.type === type),
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
        {DATES.map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.dateChip, selectedDate === d && styles.dateChipActive]}
            onPress={() => setSelectedDate(d)}
          >
            <Text style={[styles.dateChipLabel, selectedDate === d && styles.dateChipLabelActive]}>
              {d}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* RESUMO DO DIA */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <View>
            <Text style={styles.summaryKcal}>{totals.kcal} kcal</Text>
            <Text style={styles.summaryMeta}>
              Meta {dailyGoal} kcal • Restam {remaining} kcal
            </Text>
          </View>
          <View style={styles.pctBadge}>
            <Text style={styles.pctBadgeText}>{pct}%</Text>
          </View>
        </View>

        {/* Barra de progresso */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>

        {/* Macros */}
        <View style={styles.macroRow}>
          <MacroChip label="Prot." value={`${totals.protein}g`} color="#2563EB" />
          <MacroChip label="Carb." value={`${totals.carbs}g`}   color="#D97706" />
          <MacroChip label="Gord." value={`${totals.fat}g`}     color="#DC2626" />
        </View>
      </View>

      {/* REFEIÇÕES POR TIPO */}
      {grouped.map(({ type, items }) => {
        if (items.length === 0) return null;
        const cfg = MEAL_CONFIG[type];
        const typeKcal = items.reduce((s, m) => s + m.kcal, 0);

        return (
          <View key={type} style={{ marginBottom: 6 }}>
            {/* Cabeçalho do grupo */}
            <View style={styles.groupHeader}>
              <View style={[styles.groupEmoji, { backgroundColor: cfg.bg }]}>
                <Text style={{ fontSize: 16 }}>{cfg.emoji}</Text>
              </View>
              <Text style={styles.groupLabel}>{cfg.label}</Text>
              <Text style={[styles.groupKcal, { color: cfg.color }]}>{typeKcal} kcal</Text>
            </View>

            {/* Itens */}
            <View style={styles.itemsWrap}>
              {items.map((m) => (
                <View key={m.id} style={styles.mealItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.mealName}>{m.name}</Text>
                    <Text style={styles.mealMacros}>
                      P {m.proteinG}g • C {m.carbsG}g • G {m.fatG}g
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.mealKcal}>{m.kcal} kcal</Text>
                    <Text style={styles.mealTime}>{m.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        );
      })}

      {/* ADICIONAR REFEIÇÃO */}
      <TouchableOpacity style={styles.addBtn}>
        <Text style={styles.addBtnText}>➕ Adicionar refeição</Text>
      </TouchableOpacity>

      <View style={{ height: 28 }} />
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
  addBtnText: { color: "#022C22", fontWeight: "900", fontSize: 15 },
});
