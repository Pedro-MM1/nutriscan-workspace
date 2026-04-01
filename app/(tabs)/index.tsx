import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import AddMealModal from "../../components/AddMealModal";
import { auth } from "../../lib/firebase";
import { useDailyMeals } from "../../lib/hooks/useDailyMeals";
import { useUserDoc } from "../../lib/hooks/useUserDoc";
import { addMeal } from "../../lib/meals";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── helpers ──────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));
const clamp01 = (v: number) => clamp(v, 0, 1);

// ─── component ────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const [authUid, setAuthUid] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  // ── Auth ──
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
  const canAddMeal = !!uid;

  // ── User display ──
  const firstName =
    user?.displayName?.split(" ")[0] ??
    user?.email?.split("@")[0] ??
    "você";
  const avatarLetter = (user?.displayName ?? user?.email ?? "U")
    .charAt(0)
    .toUpperCase();

  // ── Firebase data ──
  const today = useMemo(() => new Date(), []);
  const { meals, totals, loading: mealsLoading } = useDailyMeals(uid, today);

  const caloriesConsumed = totals?.calories ?? 0;
  const protein = totals?.protein ?? 0;
  const carbs = totals?.carbs ?? 0;
  const fats = totals?.fat ?? 0;

  const dailyGoal = data?.goals?.kcal ?? 2200;
  const proteinGoal = data?.goals?.proteinG ?? 140;
  const carbsGoal = data?.goals?.carbsG ?? 250;
  const fatsGoal = data?.goals?.fatG ?? 70;

  const remaining = Math.max(dailyGoal - caloriesConsumed, 0);
  const ratioRaw = dailyGoal > 0 ? caloriesConsumed / dailyGoal : 0;
  const ratioRing = clamp01(ratioRaw);
  const progressPercent = Math.round(clamp(ratioRaw, 0, 2) * 100);

  const ringColor =
    ratioRaw < 0.6
      ? "#60A5FA"
      : ratioRaw <= 1.0
      ? "#34D399"
      : ratioRaw <= 1.15
      ? "#FBBF24"
      : "#F87171";

  const statusText =
    ratioRaw < 0.6
      ? "Começando"
      : ratioRaw <= 1.0
      ? "No ritmo  ✓"
      : ratioRaw <= 1.15
      ? "Atenção !"
      : "Passou do alvo";

  const pPct = Math.round(clamp01(protein / proteinGoal) * 100);
  const cPct = Math.round(clamp01(carbs / carbsGoal) * 100);
  const fPct = Math.round(clamp01(fats / fatsGoal) * 100);

  // ── Ring animation ──
  const RING_SIZE = 92;
  const RING_STROKE = 9;
  const radius = (RING_SIZE - RING_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;

  const progressAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: ratioRing,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [ratioRing]);

  const animatedDashOffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  // ── Status dot pulse ──
  const dotAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, {
          toValue: 0.25,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(dotAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // ── Streak (hardcoded por ora) ──
  const week = [
    { day: "S", ok: true },
    { day: "T", ok: true },
    { day: "Q", ok: false },
    { day: "Q", ok: true },
    { day: "S", ok: true },
    { day: "S", ok: false },
    { day: "D", ok: true },
  ];
  const streakCount = week.filter((d) => d.ok).length;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>
            {getGreeting()}, {firstName} 👋
          </Text>
          <Text style={styles.subtitle}>Acompanhe sua alimentação hoje</Text>
        </View>

        {/* Avatar com gradiente */}
        <LinearGradient
          colors={["#2563EB", "#7C3AED"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}
        >
          <Text style={styles.avatarLetter}>{avatarLetter}</Text>
        </LinearGradient>
      </View>

      {/* ── CARD PRINCIPAL ─────────────────────────────────────── */}
      <LinearGradient
        colors={["#0F172A", "#1E3A5F", "#1E1B4B"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.mainCard}
      >
        {/* Top row: kcal info + ring */}
        <View style={styles.mainTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.mainLabel}>Calorias hoje</Text>
            <Text style={styles.mainKcal}>
              {caloriesConsumed}
              <Text style={styles.mainKcalUnit}> kcal</Text>
            </Text>
            <Text style={styles.mainMeta}>
              Meta {dailyGoal} kcal • Restam {remaining} kcal
            </Text>

            {/* Status pill */}
            <View style={styles.statusPill}>
              <Animated.View
                style={[styles.statusDot, { opacity: dotAnim }]}
              />
              <Text style={styles.statusText}>{statusText}</Text>
            </View>
          </View>

          {/* Ring */}
          <View style={styles.ringWrap}>
            <Svg width={RING_SIZE} height={RING_SIZE}>
              {/* track */}
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={radius}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={RING_STROKE}
                fill="none"
              />
              {/* progress */}
              <AnimatedCircle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={radius}
                stroke={ringColor}
                strokeWidth={RING_STROKE}
                fill="none"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={animatedDashOffset as any}
                strokeLinecap="round"
                rotation="-90"
                origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
              />
            </Svg>
            <View style={styles.ringCenter}>
              <Text style={[styles.ringPct, { color: ringColor }]}>
                {progressPercent}%
              </Text>
              <Text style={styles.ringLabel}>da meta</Text>
            </View>
          </View>
        </View>

        {/* ── Macro cards 3-em-linha ── */}
        <View style={styles.macroRow}>
          <MacroCard
            label="Proteínas"
            value={`${protein}g`}
            pct={pPct}
            color="#60A5FA"
          />
          <MacroCard
            label="Carboidratos"
            value={`${carbs}g`}
            pct={cPct}
            color="#A78BFA"
          />
          <MacroCard
            label="Gorduras"
            value={`${fats}g`}
            pct={fPct}
            color="#FCD34D"
          />
        </View>
      </LinearGradient>

      {/* ── BOTÕES DE AÇÃO ─────────────────────────────────────── */}
      <LinearGradient
        colors={["#2563EB", "#7C3AED"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.scannerGradient}
      >
        <TouchableOpacity
          style={styles.actionBtnInner}
          onPress={() => router.push("/scanner")}
        >
          <Text style={styles.actionBtnTitle}>📷 Escanear alimento</Text>
          <Text style={styles.actionBtnSub}>
            IA estima calorias, macros e porção
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      <TouchableOpacity
        style={[styles.addBtn, !canAddMeal && styles.addBtnDisabled]}
        onPress={() => setAddOpen(true)}
        disabled={!canAddMeal}
      >
        <Text style={styles.addBtnTitle}>➕ Adicionar refeição</Text>
        <Text style={styles.addBtnSub}>Registrar manualmente (kcal e macros)</Text>
      </TouchableOpacity>

      {/* ── REFEIÇÕES DE HOJE ──────────────────────────────────── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Refeições de hoje</Text>
        <Text style={styles.sectionCount}>
          {meals?.length ?? 0} itens
        </Text>
      </View>

      {mealsLoading ? (
        <View style={styles.mealEmpty}>
          <Text style={styles.mealEmptyText}>Carregando…</Text>
        </View>
      ) : (meals?.length ?? 0) === 0 ? (
        <View style={styles.mealEmpty}>
          <Text style={styles.mealEmptyTitle}>Nada por aqui ainda</Text>
          <Text style={styles.mealEmptyText}>
            Adicione uma refeição manualmente ou use o scanner para começar seu dia.
          </Text>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          {meals.map((m: any) => {
            const kcal = m?.kcal ?? m?.totals?.calories ?? 0;
            const p = m?.proteinG ?? m?.totals?.protein ?? 0;
            const c = m?.carbsG ?? m?.totals?.carbs ?? 0;
            const f = m?.fatG ?? m?.totals?.fat ?? 0;
            const typeLabel =
              m?.type === "breakfast" ? "☕️ Café" :
              m?.type === "lunch"     ? "🍛 Almoço" :
              m?.type === "dinner"    ? "🍽️ Jantar" :
              m?.type === "snack"     ? "🍎 Lanche" : "🍽️ Refeição";

            return (
              <View key={m.id ?? `${m.name}-${kcal}`} style={styles.mealItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mealName}>{m.name ?? "Refeição"}</Text>
                  <Text style={styles.mealMeta}>
                    {typeLabel} • P {p}g • C {c}g • G {f}g
                  </Text>
                </View>
                <Text style={styles.mealKcal}>{kcal} kcal</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* ── STREAK SEMANAL ─────────────────────────────────────── */}
      <View style={styles.streakCard}>
        <View style={styles.streakHeaderRow}>
          <Text style={styles.streakTitle}>Consistência da semana</Text>
          <Text style={styles.streakScore}>{streakCount}/7</Text>
        </View>
        <View style={styles.streakDots}>
          {week.map((d, i) => (
            <View
              key={i}
              style={[
                styles.streakDot,
                d.ok
                  ? { backgroundColor: "#DCFCE7", borderColor: "#86EFAC" }
                  : { backgroundColor: "#F1F5F9", borderColor: "#E2E8F0" },
              ]}
            >
              <Text
                style={[
                  styles.streakDay,
                  { color: d.ok ? "#166534" : "#94A3B8" },
                ]}
              >
                {d.day}
              </Text>
            </View>
          ))}
        </View>
        <Text style={styles.streakHint}>
          Dica: marque refeições por 7 dias e ganhe um "streak" 🔥
        </Text>
      </View>

      {/* ── ATALHOS RÁPIDOS ────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>Atalhos rápidos</Text>
      <View style={styles.grid}>
        {[
          { emoji: "📓", title: "Diário",   sub: "O que você comeu",   route: "/(tabs)/diary"    },
          { emoji: "🍽",  title: "Dieta",    sub: "Plano alimentar",    route: "/(tabs)/diet"     },
          { emoji: "🏋️", title: "Treinos",  sub: "Sugestões do dia",   route: "/(tabs)/workouts" },
          { emoji: "📊",  title: "Progresso",sub: "Peso e evolução",   route: "/(tabs)/progress" },
        ].map(({ emoji, title, sub, route }) => (
          <TouchableOpacity
            key={title}
            style={styles.quickCard}
            onPress={() => router.push(route as any)}
          >
            <Text style={{ fontSize: 24 }}>{emoji}</Text>
            <View>
              <Text style={styles.quickTitle}>{title}</Text>
              <Text style={styles.quickSub}>{sub}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── EXPLORAR ───────────────────────────────────────────── */}
      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Explorar</Text>

      <TouchableOpacity
        style={styles.exploreCard}
        onPress={() => router.push("/foods")}
      >
        <Image
          source={require("../../assets/images/salad-bowl.jpg")}
          style={styles.exploreImage}
        />
        <View style={styles.exploreContent}>
          <Text style={styles.exploreTitle}>Banco de alimentos</Text>
          <Text style={styles.exploreSub}>Buscar alimentos e ver macros</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.exploreCard}
        onPress={() => router.push("/recipes")}
      >
        <Image
          source={require("../../assets/images/food-hero.jpg")}
          style={styles.exploreImage}
        />
        <View style={styles.exploreContent}>
          <Text style={styles.exploreTitle}>Receitas inteligentes</Text>
          <Text style={styles.exploreSub}>
            Importar de sites e calcular nutrição
          </Text>
        </View>
      </TouchableOpacity>

      <View style={{ height: 32 }} />

      <AddMealModal
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={async (meal) => {
          if (!uid) return;
          await addMeal(uid, {
            ...meal,
            type: meal.type ?? "lunch",
            dateKey: new Date().toISOString().slice(0, 10),
          });
          setAddOpen(false);
        }}
      />
    </ScrollView>
  );
}

// ─── MacroCard ────────────────────────────────────────────────────────────────

function MacroCard({
  label,
  value,
  pct,
  color,
}: {
  label: string;
  value: string;
  pct: number;
  color: string;
}) {
  return (
    <View style={styles.macroCard}>
      <Text style={[styles.macroCardLabel, { color }]}>{label}</Text>
      <Text style={styles.macroCardValue}>{value}</Text>
      <View style={styles.macroCardTrack}>
        <View
          style={[
            styles.macroCardFill,
            { width: `${pct}%` as any, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={[styles.macroCardPct, { color }]}>{pct}%</Text>
    </View>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    padding: 18,
    paddingBottom: 32,
    backgroundColor: "#F8FAFC",
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 20,
  },
  headerLeft: { flex: 1, paddingRight: 12 },
  greeting: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.6,
  },
  subtitle: {
    color: "#64748B",
    fontSize: 14,
    marginTop: 4,
    fontWeight: "600",
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  // ── Main card ──
  mainCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
    shadowColor: "#1E1B4B",
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  mainTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  mainLabel: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  mainKcal: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: -1.5,
    lineHeight: 46,
  },
  mainKcalUnit: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
  },
  mainMeta: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    marginTop: 6,
    fontWeight: "600",
  },

  // Status pill
  statusPill: {
    marginTop: 12,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: "#34D399",
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  // Ring
  ringWrap: {
    width: 92,
    height: 92,
    alignItems: "center",
    justifyContent: "center",
  },
  ringCenter: {
    position: "absolute",
    alignItems: "center",
  },
  ringPct: {
    fontSize: 17,
    fontWeight: "900",
  },
  ringLabel: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 1,
  },

  // Macro cards row
  macroRow: {
    flexDirection: "row",
    gap: 8,
  },
  macroCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.09)",
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  macroCardLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  macroCardValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 6,
  },
  macroCardTrack: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 4,
  },
  macroCardFill: {
    height: "100%",
    borderRadius: 999,
  },
  macroCardPct: {
    fontSize: 10,
    fontWeight: "700",
  },

  // ── Action buttons ──
  scannerGradient: {
    borderRadius: 18,
    marginBottom: 10,
    shadowColor: "#2563EB",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  actionBtnInner: {
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  actionBtnTitle: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
  },
  actionBtnSub: {
    color: "rgba(255,255,255,0.75)",
    marginTop: 3,
    fontSize: 12,
    fontWeight: "600",
  },
  addBtn: {
    backgroundColor: "#22C55E",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 4,
  },
  addBtnDisabled: {
    backgroundColor: "#A7F3D0",
  },
  addBtnTitle: {
    color: "#052e16",
    fontWeight: "900",
    fontSize: 15,
  },
  addBtnSub: {
    color: "#166534",
    marginTop: 3,
    fontSize: 12,
    fontWeight: "600",
  },

  // ── Meals ──
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.3,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionCount: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "800",
  },
  mealEmpty: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    padding: 16,
    marginBottom: 4,
  },
  mealEmptyTitle: {
    color: "#0F172A",
    fontWeight: "900",
    fontSize: 15,
    marginBottom: 4,
  },
  mealEmptyText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
  },
  mealItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 14,
  },
  mealName: {
    color: "#0F172A",
    fontWeight: "900",
    fontSize: 14,
    marginBottom: 3,
  },
  mealMeta: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
  },
  mealKcal: {
    color: "#16A34A",
    fontWeight: "900",
    fontSize: 14,
  },

  // ── Streak ──
  streakCard: {
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  streakHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 10,
  },
  streakTitle: {
    color: "#0F172A",
    fontWeight: "900",
    fontSize: 14,
  },
  streakScore: {
    color: "#16A34A",
    fontWeight: "900",
    fontSize: 14,
  },
  streakDots: {
    flexDirection: "row",
    gap: 8,
  },
  streakDot: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  streakDay: {
    fontWeight: "900",
    fontSize: 12,
  },
  streakHint: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 10,
  },

  // ── Quick actions ──
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minHeight: 108,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  quickTitle: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  quickSub: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
  },

  // ── Explore ──
  exploreCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 10,
    alignItems: "center",
  },
  exploreImage: {
    width: 70,
    height: 70,
    borderRadius: 14,
  },
  exploreContent: { flex: 1 },
  exploreTitle: {
    color: "#0F172A",
    fontWeight: "900",
    fontSize: 14,
  },
  exploreSub: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 4,
  },
});
