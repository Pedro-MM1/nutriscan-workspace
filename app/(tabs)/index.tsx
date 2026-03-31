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
import { Colors } from '../../constants/Colors';
import { auth } from "../../lib/firebase";
import { useDailyMeals } from "../../lib/hooks/useDailyMeals";
import { useUserDoc } from "../../lib/hooks/useUserDoc";
import { addMeal } from "../../lib/meals";
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function HomeScreen() {
  const router = useRouter();
  const [authUid, setAuthUid] = useState<string | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);


  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        try {
          const cred = await signInAnonymously(auth);
          setAuthUid(cred.user.uid);
        } catch (e) {
          console.log("❌ Falha no signInAnonymously:", e);
          setAuthUid(null);
        }
        return;
      }

      setAuthUid(u.uid);
    });

    return () => unsub();
  }, []);

  // 🔥 Dados reais do Firebase
  const { user, data, loading } = useUserDoc();

  const uid = user?.uid ?? authUid ?? null;
  const today = useMemo(() => new Date(), []);
  const { meals, totals, loading: mealsLoading } = useDailyMeals(uid, today);
  const canAddMeal = !!uid;

  // ✅ fallback pra não quebrar enquanto carrega / uid null
  const caloriesConsumed = totals?.calories ?? 0;
  const protein = totals?.protein ?? 0;
  const carbs = totals?.carbs ?? 0;
  const fats = totals?.fat ?? 0;

  // 🎯 Metas vindas do Firestore (fallback seguro)
  const dailyGoal = data?.goals?.kcal ?? 2200;
  const proteinGoal = data?.goals?.proteinG ?? 140;
  const carbsGoal = data?.goals?.carbsG ?? 250;
  const fatsGoal = data?.goals?.fatG ?? 70;


  const remaining = Math.max(dailyGoal - caloriesConsumed, 0);

  // ---------------- UX Premium (faixas + status) ----------------
  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
  const ratioRaw = dailyGoal > 0 ? caloriesConsumed / dailyGoal : 0; // pode passar de 1
  const ratioRing = clamp(ratioRaw, 0, 1); // ring visual não passa de 100%

  const progressPercent = Math.round(clamp(ratioRaw, 0, 2) * 100); // pode mostrar até 200% (opcional)

  const ringColor =
    ratioRaw < 0.6 ? '#60A5FA' :      // azul (começando)
      ratioRaw <= 1.0 ? '#22C55E' :     // verde (no ritmo)
        ratioRaw <= 1.15 ? '#F59E0B' :    // amarelo (passou um pouco)
          '#EF4444';                        // vermelho (passou muito)

  const statusText =
    ratioRaw < 0.6 ? 'Começando' :
      ratioRaw <= 1.0 ? 'No ritmo' :
        ratioRaw <= 1.15 ? 'Atenção' :
          'Passou do alvo';

  const statusHint =
    ratioRaw < 0.6 ? '↑' :
      ratioRaw <= 1.0 ? '✓' :
        ratioRaw <= 1.15 ? '!' :
          '✕';

  const userName = 'Pedro';

  // ---------- CÍRCULO (kcal) ----------
  const size = 84;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  // ---------- ANIMAÇÃO DO RING ----------
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: ratioRing,       // 0..1
      duration: 700,
      useNativeDriver: false,   // SVG precisa ser false
    }).start();
  }, [ratioRing, progressAnim]);

  const animatedDashOffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const shadowSoft = {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  };

  const shadowMedium = {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  };

  // ---------- FUNÇÕES ----------
  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
  const macroPct = (value: number, goal: number) => Math.round(clamp01(value / goal) * 100);

  const pPct = macroPct(protein, proteinGoal);
  const cPct = macroPct(carbs, carbsGoal);
  const fPct = macroPct(fats, fatsGoal);

  // Streak semanal (7 dias) — true = bateu meta / registrou
  const week = [
    { day: 'S', ok: true },
    { day: 'T', ok: true },
    { day: 'Q', ok: false },
    { day: 'Q', ok: true },
    { day: 'S', ok: true },
    { day: 'S', ok: false },
    { day: 'D', ok: true },
  ];

  const streakCount = week.reduce((acc, d) => (d.ok ? acc + 1 : acc), 0);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Image
            source={require('../../assets/images/icon.png')
            }
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>NutriScan Fitness</Text>
        </View>

        <Text style={styles.greeting}>Olá, {userName} 👋</Text>
        <Text style={styles.subtitle}>Acompanhe sua alimentação hoje</Text>
      </View>

      {/* CARD PRINCIPAL */}
      <View style={[styles.mainCard, shadowMedium]}>

        <View style={styles.mainTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.mainTitle}>Calorias</Text>

            <Text style={styles.mainValue}>
              {caloriesConsumed} <Text style={styles.mainValueUnit}>kcal</Text>
            </Text>

            <Text style={styles.mainMeta}>
              Meta: {dailyGoal} kcal • Restam: {remaining} kcal
            </Text>

            <View style={styles.scoreRow}>

              <View style={styles.scorePill}>
                <Text style={styles.scorePillLabel}>Status</Text>
                <Text style={styles.scorePillValue}>{statusText}</Text>
                <Text style={[styles.scorePillHint, { color: ringColor }]}>{statusHint}</Text>

              </View>
            </View>
          </View>

          {/* CÍRCULO DE PROGRESSO */}
          <View style={styles.ringWrap}>
            <Svg width={size} height={size}>
              {/* trilha */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#0F172A"
                strokeWidth={stroke}
                fill="none"
              />

              {/* progresso (animado) */}
              <AnimatedCircle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={ringColor}
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={animatedDashOffset as any}
                strokeLinecap="round"
                rotation="-90"
                origin={`${size / 2}, ${size / 2}`}
              />
            </Svg>

            <View style={styles.ringText}>
              <Text style={[styles.ringPct, { color: ringColor }]}>{progressPercent}%</Text>
              <Text style={styles.ringLabel}>da meta</Text>
            </View>
          </View>
        </View>

        {/* Macros com mini progress (P/C/G) */}
        <View style={[styles.macroBlock, shadowSoft]}>

          <Text style={styles.macroBlockTitle}>Macros</Text>

          <MacroRow label="Proteínas" value={`${protein}g`} pct={pPct} />
          <MacroRow label="Carboidratos" value={`${carbs}g`} pct={cPct} />
          <MacroRow label="Gorduras" value={`${fats}g`} pct={fPct} />

          <Text style={styles.macroHint}>
            Metas exemplo: P {proteinGoal}g • C {carbsGoal}g • G {fatsGoal}g
          </Text>
        </View>
      </View>

      {/* REFEIÇÕES DE HOJE */}
      <View style={{ marginTop: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
          <Text style={styles.sectionTitle}>Refeições de hoje</Text>
          <Text style={{ color: "#94A3B8", fontSize: 12, fontWeight: "800" }}>
            {meals?.length ?? 0} itens
          </Text>
        </View>

        {mealsLoading ? (
          <Text style={{ color: "#9CA3AF" }}>Carregando...</Text>
        ) : (meals?.length ?? 0) === 0 ? (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#E2E8F0",
              borderRadius: 18,
              padding: 16,
            }}
          >
            <Text style={{ color: Colors.light.text, fontWeight: "900", fontSize: 15 }}>
              Nada por aqui ainda
            </Text>
            <Text
              style={{
                color: "#64748B",
                marginTop: 6,
                fontSize: 13,
                fontWeight: "600",
                lineHeight: 20,
              }}
            >
              Adicione uma refeição manualmente ou use o scanner para começar seu dia.
            </Text>
          </View>

        ) : (
          <View style={{ gap: 10 }}>
            {meals.map((m: any) => {
              // compat: se vier no formato novo ou antigo, pega de ambos
              const kcal = m?.kcal ?? m?.totals?.calories ?? 0;
              const p = m?.proteinG ?? m?.totals?.protein ?? 0;
              const c = m?.carbsG ?? m?.totals?.carbs ?? 0;
              const f = m?.fatG ?? m?.totals?.fat ?? 0;

              const typeLabel =
                m?.type === "breakfast" ? "☕️ Café" :
                  m?.type === "lunch" ? "🍛 Almoço" :
                    m?.type === "dinner" ? "🍽️ Jantar" :
                      m?.type === "snack" ? "🍎 Lanche" :
                        "🍽️ Refeição";

              return (
                <View
                  key={m.id ?? `${m.name}-${kcal}-${Math.random()}`}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    borderRadius: 18,
                    padding: 16,
                  }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
                    <Text style={{ color: Colors.light.text, fontWeight: "900", fontSize: 15 }}>
                      {m.name ?? "Refeição"}
                    </Text>

                    <Text style={{ color: "#16A34A", fontWeight: "900" }}>{kcal} kcal</Text>
                  </View>

                  <Text
                    style={{
                      color: "#64748B",
                      marginTop: 6,
                      fontSize: 12,
                      fontWeight: "600",
                      lineHeight: 18,
                    }}
                  >
                    {typeLabel} • P {p}g • C {c}g • G {f}g
                  </Text>
                </View>
              );

            })}
          </View>
        )}
      </View>

      {/* STREAK SEMANAL */}
      <View style={styles.streakCard}>
        <View style={styles.streakHeader}>
          <Text style={styles.streakTitle}>Consistência da semana</Text>
          <Text style={styles.streakScore}>{streakCount}/7</Text>
        </View>

        <View style={styles.streakRow}>
          {week.map((d, idx) => (
            <View
              key={`${d.day}-${idx}`}
              style={[
                styles.streakDot,
                {
                  backgroundColor: d.ok ? "#DCFCE7" : "#F1F5F9",
                  borderColor: d.ok ? "#86EFAC" : Colors.light.border,
                },
              ]}
            >
              <Text style={[styles.streakDay, { color: d.ok ? "#166534" : "#94A3B8" }]}>

                {d.day}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.streakHint}>
          Dica: marque refeições por 7 dias e ganhe um “streak” 🔥
        </Text>
      </View>

      {/* AÇÕES PRINCIPAIS */}
      <TouchableOpacity
        style={[styles.scanButton, { backgroundColor: "#60A5FA" }]}
        onPress={() => router.push("/scanner")}
      >
        <Text style={[styles.scanButtonTitle, { color: "#0B1220" }]}>
          📷 Escanear alimento
        </Text>
        <Text style={[styles.scanButtonSub, { color: "#0B1220" }]}>
          Use a IA para estimar calorias, macros e porção
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.scanButton,
          { backgroundColor: canAddMeal ? "#22C55E" : "#A7F3D0" }
        ]}
        onPress={() => setAddOpen(true)}
        disabled={!canAddMeal}
      >
        <Text style={styles.scanButtonTitle}>➕ Adicionar refeição</Text>
        <Text style={styles.scanButtonSub}>
          Registrar manualmente (kcal e macros)
        </Text>
      </TouchableOpacity>

      {!canAddMeal && (
        <Text style={{ marginTop: 6, color: "#94A3B8", fontSize: 12 }}>
          Carregando sessão… aguarde um instante.
        </Text>
      )}



      {/* AÇÕES RÁPIDAS */}
      <Text style={styles.sectionTitle}>Atalhos rápidos</Text>

      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push('/(tabs)/diary')}
        >
          <Text style={{ fontSize: 22 }}>📓</Text>
          <View>
            <Text style={styles.quickTitle}>Diário</Text>
            <Text style={styles.quickSub}>O que você comeu</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push('/(tabs)/diet')}
        >
          <Text style={{ fontSize: 22 }}>🍽</Text>
          <View>
            <Text style={styles.quickTitle}>Dieta</Text>
            <Text style={styles.quickSub}>Plano alimentar</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push('/(tabs)/workouts')}
        >
          <Text style={{ fontSize: 22 }}>🏋️</Text>
          <View>
            <Text style={styles.quickTitle}>Treinos</Text>
            <Text style={styles.quickSub}>Sugestões do dia</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push('/(tabs)/progress')}
        >
          <Text style={{ fontSize: 22 }}>📊</Text>
          <View>
            <Text style={styles.quickTitle}>Progresso</Text>
            <Text style={styles.quickSub}>Peso e evolução</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* EXPLORAR (com imagens) */}
      <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Explorar</Text>

      <TouchableOpacity style={styles.exploreCard} onPress={() => router.push('/foods')}>
        <Image
          source={require('../../assets/images/salad-bowl.jpg')}
          style={styles.exploreImage}
        />
        <View style={styles.exploreContent}>
          <Text style={styles.exploreTitle}>Banco de alimentos</Text>
          <Text style={styles.exploreSub}>Buscar alimentos e ver macros</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.exploreCard} onPress={() => router.push('/recipes')}>
        <Image
          source={require('../../assets/images/food-hero.jpg')}
          style={styles.exploreImage}
        />
        <View style={styles.exploreContent}>
          <Text style={styles.exploreTitle}>Receitas inteligentes</Text>
          <Text style={styles.exploreSub}>Importar de sites e calcular nutrição</Text>
        </View>
      </TouchableOpacity>

      <View style={{ height: 28 }} />

      <AddMealModal
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={async (meal) => {
          if (!uid) return;

          const dateKey = new Date().toISOString().slice(0, 10);

          await addMeal(uid, {
            ...meal,
            type: meal.type ?? "lunch",
            dateKey,
          });

          // fecha o modal
          setAddOpen(false);
        }}
      />
    </ScrollView>

  );
}

/** Mini progress row para macros */
function MacroRow({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <View style={styles.macroRow}>
      <View style={styles.macroRowTop}>
        <Text style={styles.macroRowLabel}>{label}</Text>
        <Text style={styles.macroRowValue}>{value}</Text>
      </View>

      <View style={styles.macroTrack}>
        <View style={[styles.macroFill, { width: `${pct}%` }]} />
      </View>

      <Text style={styles.macroPct}>{pct}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    paddingBottom: 28,
    backgroundColor: "#F8FAFC",
  },

  // HEADER (logo + nome + saudação)
  header: {
    marginTop: 6,
    marginBottom: 18,
    paddingTop: 4,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  logo: {
    width: 36,
    height: 36,
    marginRight: 12,
    borderRadius: 10,
  },
  appName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.text,
    letterSpacing: -0.4,
  },

  greeting: {
    color: Colors.light.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.8,
  },

  subtitle: {
    color: '#64748B',
    marginTop: 6,
    fontSize: 15,
    lineHeight: 22,
  },

  // CARD PRINCIPAL
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mainTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
  },
  mainTitle: {
    color: '#64748B',
    fontSize: 13,
    marginBottom: 6,
  },

  mainValue: {
    color: Colors.light.text,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 34,
  },

  mainValueUnit: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },

  mainMeta: {
    color: '#64748B',
    marginTop: 6,
    fontSize: 12,
  },


  // SCORE PILL
  scoreRow: {
    marginTop: 10,
  },
  scorePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },

  scorePillLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },

  scorePillHint: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },


  scorePillValue: {
    color: Colors.light.text,
    fontSize: 14,
    fontWeight: '900',
  },



  // Ring
  ringWrap: {
    width: 92,
    height: 92,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ringText: {
    position: 'absolute',
    alignItems: 'center',
  },
  ringPct: {
    fontWeight: '900',
    fontSize: 16,
  },
  ringLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '700',
  },

  // Macros block
  macroBlock: {
    marginTop: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  macroBlockTitle: {
    color: Colors.light.text,
    fontWeight: '900',
    marginBottom: 8,
  },

  macroRow: {
    marginBottom: 10,
  },
  macroRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  macroRowLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },

  macroRowValue: {
    color: Colors.light.text,
    fontSize: 12,
    fontWeight: '900',
  },

  macroTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },

  macroFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 999,
  },
  macroPct: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '700',
  },

  macroHint: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 6,
  },

  // Streak (LIGHT)
  streakCard: {
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  streakHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  streakTitle: {
    color: Colors.light.text,
    fontWeight: "900",
    fontSize: 14,
  },
  streakScore: {
    color: "#16A34A",
    fontWeight: "900",
    fontSize: 14,
  },
  streakRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
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


  // Primary action
  scanButton: {
    marginTop: 14,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  scanButtonTitle: {
    color: '#022C22',
    fontWeight: '900',
    fontSize: 15,
  },
  scanButtonSub: {
    color: '#052e16',
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },

  sectionTitle: {
    color: Colors.light.text,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 20,
    marginBottom: 12,
    letterSpacing: -0.3,
  },


  // Quick actions grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  quickCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 108,
    justifyContent: 'space-between',
  },

  quickTitle: {
    color: Colors.light.text,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 8,
    letterSpacing: -0.2,
  },

  quickSub: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },


  // Explore
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
  exploreContent: {
    flex: 1,
  },
  exploreTitle: {
    color: Colors.light.text,
    fontWeight: '900',
    fontSize: 14,
  },

  exploreSub: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
  },

});
