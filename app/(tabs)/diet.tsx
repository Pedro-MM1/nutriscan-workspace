import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/Colors";

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

interface MealPlan {
  breakfast: string;
  lunch: string;
  dinner: string;
  snack: string;
  kcal: number;
}

const WEEKLY_PLAN: Record<string, MealPlan> = {
  Seg: {
    breakfast: "Ovos mexidos + pão integral + suco natural",
    lunch:     "Frango grelhado + arroz integral + brócolis",
    dinner:    "Salmão assado + batata doce + salada verde",
    snack:     "Whey protein + 1 banana",
    kcal: 2180,
  },
  Ter: {
    breakfast: "Tapioca com queijo cottage + café com leite",
    lunch:     "Patinho moído + macarrão integral + abobrinha",
    dinner:    "Omelete de legumes + torrada integral",
    snack:     "Iogurte grego + granola sem açúcar",
    kcal: 2090,
  },
  Qua: {
    breakfast: "Panqueca de aveia + mel + frutas vermelhas",
    lunch:     "Tilápia grelhada + quinoa + espinafre",
    dinner:    "Peito de peru + purê de abóbora",
    snack:     "Mix de castanhas + maçã",
    kcal: 2150,
  },
  Qui: {
    breakfast: "Iogurte grego + chia + banana fatiada",
    lunch:     "Carne bovina magra + arroz + feijão + cenoura",
    dinner:    "Frango ao forno + legumes assados",
    snack:     "Barra de proteína + whey",
    kcal: 2220,
  },
  Sex: {
    breakfast: "Ovos pochê + abacate + torrada integral",
    lunch:     "Atum com arroz e tomate",
    dinner:    "Tilápia com batata doce e aspargos",
    snack:     "Iogurte proteico + morango",
    kcal: 2100,
  },
  Sáb: {
    breakfast: "Açaí bowl com granola e frutas",
    lunch:     "Frango na chapa + salada com azeite",
    dinner:    "Pizza proteica de frango (caseira)",
    snack:     "Queijo cottage + uvas",
    kcal: 2300,
  },
  Dom: {
    breakfast: "Tapioca de banana + ovo mexido",
    lunch:     "Carne assada + arroz + brócolis",
    dinner:    "Sopa de legumes com frango desfiado",
    snack:     "Vitamina de morango com whey",
    kcal: 2050,
  },
};

const MEAL_ROW_CONFIG = [
  { key: "breakfast" as keyof MealPlan, emoji: "☕️", label: "Café", color: "#D97706", bg: "#FEF3C7" },
  { key: "snack"     as keyof MealPlan, emoji: "🍎", label: "Lanche", color: "#166534", bg: "#DCFCE7" },
  { key: "lunch"     as keyof MealPlan, emoji: "🍛", label: "Almoço", color: "#0369A1", bg: "#E0F2FE" },
  { key: "dinner"    as keyof MealPlan, emoji: "🍽️", label: "Jantar", color: "#7C3AED", bg: "#EDE9FE" },
];

const TODAY_IDX = new Date().getDay(); // 0 = dom
const TODAY_LABEL = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][TODAY_IDX];

export default function DietScreen() {
  const [selectedDay, setSelectedDay] = useState(TODAY_LABEL);
  const plan = WEEKLY_PLAN[selectedDay];
  const avgKcal = Math.round(
    Object.values(WEEKLY_PLAN).reduce((s, p) => s + p.kcal, 0) / 7
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Plano alimentar</Text>
        <Text style={styles.subtitle}>Sua dieta semanal personalizada</Text>
      </View>

      {/* CARDS DE RESUMO */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Meta diária</Text>
          <Text style={styles.summaryValue}>2.200</Text>
          <Text style={styles.summaryUnit}>kcal</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Média semanal</Text>
          <Text style={styles.summaryValue}>{avgKcal.toLocaleString("pt-BR")}</Text>
          <Text style={styles.summaryUnit}>kcal</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Protocolo</Text>
          <Text style={[styles.summaryValue, { fontSize: 13 }]}>Alto{"\n"}proteico</Text>
        </View>
      </View>

      {/* SELETOR DE DIA */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 16 }}
        contentContainerStyle={{ gap: 8, paddingRight: 8 }}
      >
        {DAYS.map((day) => {
          const isToday = day === TODAY_LABEL;
          const isSelected = day === selectedDay;
          return (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayChip,
                isSelected && styles.dayChipActive,
                isToday && !isSelected && styles.dayChipToday,
              ]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[
                styles.dayChipLabel,
                isSelected && styles.dayChipLabelActive,
                isToday && !isSelected && { color: "#2563EB" },
              ]}>
                {day}
              </Text>
              {isToday && (
                <View style={[styles.todayDot, isSelected && { backgroundColor: "#FFFFFF" }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* CARD DO DIA */}
      <View style={styles.dayCard}>
        <View style={styles.dayCardHeader}>
          <Text style={styles.dayCardTitle}>{selectedDay === TODAY_LABEL ? "Hoje" : selectedDay}</Text>
          <View style={styles.kcalBadge}>
            <Text style={styles.kcalBadgeText}>{plan.kcal.toLocaleString("pt-BR")} kcal</Text>
          </View>
        </View>

        {MEAL_ROW_CONFIG.map(({ key, emoji, label, color, bg }) => (
          <View key={key} style={styles.mealRow}>
            <View style={[styles.mealEmoji, { backgroundColor: bg }]}>
              <Text style={{ fontSize: 16 }}>{emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.mealTypeLabel, { color }]}>{label}</Text>
              <Text style={styles.mealDescription}>{plan[key] as string}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* VISÃO SEMANAL */}
      <Text style={styles.sectionTitle}>Visão da semana</Text>
      <View style={styles.weekGrid}>
        {DAYS.map((day) => {
          const p = WEEKLY_PLAN[day];
          const isSelected = day === selectedDay;
          const isToday = day === TODAY_LABEL;
          return (
            <TouchableOpacity
              key={day}
              style={[styles.weekItem, isSelected && styles.weekItemSelected]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[styles.weekDay, isSelected && { color: "#FFFFFF" }]}>{day}</Text>
              {isToday && <View style={[styles.todayDotSmall, isSelected && { backgroundColor: "#FFFFFF" }]} />}
              <Text style={[styles.weekKcal, isSelected && { color: "#FFFFFF" }]}>
                {p.kcal}
              </Text>
              <Text style={[styles.weekKcalUnit, isSelected && { color: "rgba(255,255,255,0.7)" }]}>kcal</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* DICAS NUTRICIONAIS */}
      <Text style={styles.sectionTitle}>Dicas do plano</Text>
      {TIPS.map((tip, i) => (
        <View key={i} style={styles.tipCard}>
          <Text style={{ fontSize: 20 }}>{tip.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>{tip.title}</Text>
            <Text style={styles.tipBody}>{tip.body}</Text>
          </View>
        </View>
      ))}

      <View style={{ height: 28 }} />
    </ScrollView>
  );
}

const TIPS = [
  {
    emoji: "💧",
    title: "Hidratação",
    body: "Beba pelo menos 35 ml de água por kg de peso corporal ao dia.",
  },
  {
    emoji: "⏰",
    title: "Intervalos",
    body: "Mantenha refeições a cada 3–4 horas para manter o metabolismo ativo.",
  },
  {
    emoji: "🥩",
    title: "Proteína em todas as refeições",
    body: "Garanta ao menos 20 g de proteína por refeição para preservar a massa muscular.",
  },
];

const styles = StyleSheet.create({
  container: { padding: 18, paddingBottom: 32, backgroundColor: "#F8FAFC" },

  header: { marginTop: 6, marginBottom: 18 },
  title: { fontSize: 28, fontWeight: "900", color: Colors.light.text, letterSpacing: -0.8 },
  subtitle: { color: "#64748B", fontSize: 14, marginTop: 6, fontWeight: "600" },

  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  summaryCard: {
    flex: 1, backgroundColor: "#FFFFFF", borderRadius: 18, padding: 14,
    borderWidth: 1, borderColor: "#E2E8F0", alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  summaryLabel: { color: "#64748B", fontSize: 11, fontWeight: "700", marginBottom: 4, textAlign: "center" },
  summaryValue: { color: Colors.light.text, fontSize: 18, fontWeight: "900", textAlign: "center" },
  summaryUnit: { color: "#94A3B8", fontSize: 11, fontWeight: "700", marginTop: 2 },

  dayChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    backgroundColor: "#F1F5F9", borderWidth: 1, borderColor: "#E2E8F0",
    alignItems: "center",
  },
  dayChipActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  dayChipToday: { borderColor: "#2563EB" },
  dayChipLabel: { fontSize: 13, fontWeight: "800", color: "#64748B" },
  dayChipLabelActive: { color: "#FFFFFF" },
  todayDot: {
    width: 5, height: 5, borderRadius: 999,
    backgroundColor: "#2563EB", marginTop: 3,
  },

  dayCard: {
    backgroundColor: "#FFFFFF", borderRadius: 22, padding: 18,
    borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 20,
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 }, elevation: 4,
  },
  dayCardHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 16,
  },
  dayCardTitle: { fontSize: 18, fontWeight: "900", color: Colors.light.text },
  kcalBadge: {
    backgroundColor: "#EFF6FF", borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: "#BFDBFE",
  },
  kcalBadgeText: { color: "#1D4ED8", fontWeight: "900", fontSize: 13 },

  mealRow: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#F1F5F9",
  },
  mealEmoji: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  mealTypeLabel: { fontSize: 11, fontWeight: "800", marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.4 },
  mealDescription: { fontSize: 13, color: Colors.light.text, fontWeight: "700", lineHeight: 19 },

  sectionTitle: {
    color: Colors.light.text, fontSize: 17, fontWeight: "900",
    marginBottom: 12, marginTop: 4, letterSpacing: -0.3,
  },

  weekGrid: { flexDirection: "row", gap: 6, marginBottom: 20 },
  weekItem: {
    flex: 1, backgroundColor: "#FFFFFF", borderRadius: 14, padding: 10,
    borderWidth: 1, borderColor: "#E2E8F0", alignItems: "center",
  },
  weekItemSelected: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  weekDay: { fontSize: 11, fontWeight: "900", color: Colors.light.text, marginBottom: 4 },
  todayDotSmall: { width: 4, height: 4, borderRadius: 999, backgroundColor: "#2563EB", marginBottom: 4 },
  weekKcal: { fontSize: 12, fontWeight: "900", color: Colors.light.text },
  weekKcalUnit: { fontSize: 9, color: "#94A3B8", fontWeight: "700" },

  tipCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 10,
  },
  tipTitle: { fontSize: 14, fontWeight: "900", color: Colors.light.text, marginBottom: 3 },
  tipBody: { fontSize: 12, color: "#64748B", fontWeight: "600", lineHeight: 18 },
});
