import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/Colors";

const WEIGHT_DATA = [
  { date: "24/03", kg: 82.5 },
  { date: "25/03", kg: 82.1 },
  { date: "26/03", kg: 81.8 },
  { date: "27/03", kg: 82.0 },
  { date: "28/03", kg: 81.5 },
  { date: "29/03", kg: 81.2 },
  { date: "30/03", kg: 81.0 },
];

const PERIODS = ["7 dias", "30 dias", "3 meses"];

export default function ProgressScreen() {
  const router = useRouter();
  const [period, setPeriod] = useState("7 dias");

  const current = WEIGHT_DATA[WEIGHT_DATA.length - 1].kg;
  const start = WEIGHT_DATA[0].kg;
  const diff = (current - start).toFixed(1);
  const diffPositive = parseFloat(diff) > 0;

  const maxKg = Math.max(...WEIGHT_DATA.map((d) => d.kg));
  const minKg = Math.min(...WEIGHT_DATA.map((d) => d.kg));
  const range = maxKg - minKg || 1;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Progresso</Text>
        <Text style={styles.subtitle}>Evolução do seu peso e metas</Text>
      </View>

      {/* CARDS DE RESUMO */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Peso atual</Text>
          <Text style={styles.summaryValue}>{current} kg</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Variação</Text>
          <Text style={[styles.summaryValue, { color: diffPositive ? "#EF4444" : "#22C55E" }]}>
            {diffPositive ? "+" : ""}{diff} kg
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Meta</Text>
          <Text style={styles.summaryValue}>78 kg</Text>
        </View>
      </View>

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

      {/* GRÁFICO DE BARRAS SIMPLES */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Peso ({period})</Text>
        <View style={styles.chartArea}>
          {WEIGHT_DATA.map((d, i) => {
            const heightPct = ((d.kg - minKg) / range) * 60 + 20;
            return (
              <View key={i} style={styles.barWrap}>
                <Text style={styles.barValue}>{d.kg}</Text>
                <View style={[styles.bar, { height: heightPct }]} />
                <Text style={styles.barDate}>{d.date.split("/")[0]}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* REGISTRO DE PESO */}
      <Text style={styles.sectionTitle}>Registrar peso</Text>
      <TouchableOpacity style={styles.addWeightBtn}>
        <Text style={styles.addWeightIcon}>⚖️</Text>
        <View>
          <Text style={styles.addWeightTitle}>Adicionar medição</Text>
          <Text style={styles.addWeightSub}>Registre seu peso de hoje</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      {/* HISTÓRICO */}
      <Text style={styles.sectionTitle}>Histórico recente</Text>
      {[...WEIGHT_DATA].reverse().map((d, i) => (
        <View key={i} style={styles.historyItem}>
          <View>
            <Text style={styles.historyDate}>{d.date}</Text>
            <Text style={styles.historyKg}>{d.kg} kg</Text>
          </View>
          {i === 0 && (
            <View style={styles.latestBadge}>
              <Text style={styles.latestBadgeText}>Mais recente</Text>
            </View>
          )}
        </View>
      ))}

      <View style={{ height: 28 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, paddingBottom: 32, backgroundColor: "#F8FAFC" },
  header: { marginTop: 6, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "900", color: Colors.light.text, letterSpacing: -0.8 },
  subtitle: { color: "#64748B", fontSize: 14, marginTop: 6, fontWeight: "600" },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  summaryCard: {
    flex: 1, backgroundColor: "#FFFFFF", borderRadius: 18, padding: 14,
    borderWidth: 1, borderColor: "#E2E8F0", alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  summaryLabel: { color: "#64748B", fontSize: 11, fontWeight: "700", marginBottom: 6 },
  summaryValue: { color: Colors.light.text, fontSize: 16, fontWeight: "900" },
  periodRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  periodBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 10,
    backgroundColor: "#F1F5F9", borderWidth: 1, borderColor: "#E2E8F0", alignItems: "center",
  },
  periodBtnActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  periodLabel: { fontSize: 12, fontWeight: "800", color: "#64748B" },
  periodLabelActive: { color: "#FFFFFF" },
  chartCard: {
    backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 16,
    shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 3,
  },
  chartTitle: { color: Colors.light.text, fontWeight: "900", fontSize: 14, marginBottom: 16 },
  chartArea: { flexDirection: "row", alignItems: "flex-end", gap: 6, height: 110 },
  barWrap: { flex: 1, alignItems: "center", gap: 4 },
  barValue: { fontSize: 9, color: "#64748B", fontWeight: "700" },
  bar: { width: "100%", backgroundColor: "#2563EB", borderRadius: 6 },
  barDate: { fontSize: 10, color: "#94A3B8", fontWeight: "700" },
  sectionTitle: { color: Colors.light.text, fontSize: 17, fontWeight: "900", marginBottom: 12, marginTop: 4, letterSpacing: -0.3 },
  addWeightBtn: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#FFFFFF", borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 16,
  },
  addWeightIcon: { fontSize: 22 },
  addWeightTitle: { color: Colors.light.text, fontWeight: "900", fontSize: 15 },
  addWeightSub: { color: "#64748B", fontSize: 12, fontWeight: "600", marginTop: 2 },
  chevron: { fontSize: 22, color: "#94A3B8", marginLeft: "auto" },
  historyItem: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#FFFFFF", borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 8,
  },
  historyDate: { color: "#64748B", fontSize: 12, fontWeight: "700" },
  historyKg: { color: Colors.light.text, fontWeight: "900", fontSize: 15, marginTop: 2 },
  latestBadge: { backgroundColor: "#DCFCE7", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  latestBadgeText: { color: "#166534", fontSize: 11, fontWeight: "800" },
});
