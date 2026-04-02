import { doc, getDoc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { db } from '../../lib/firebase';
import { useAuth } from '../../services/auth';

type Goal = 'perda_de_peso' | 'ganho_de_massa' | 'manutencao';

const GOALS: { key: Goal; label: string; emoji: string }[] = [
    { key: 'perda_de_peso', label: 'Emagrecimento', emoji: '🔥' },
    { key: 'ganho_de_massa', label: 'Hipertrofia', emoji: '💪' },
    { key: 'manutencao', label: 'Manutenção', emoji: '⚖️' },
];

const GOAL_LABELS: Record<Goal, string> = {
    perda_de_peso: 'Emagrecimento',
    ganho_de_massa: 'Hipertrofia',
    manutencao: 'Manutenção',
};

interface WorkoutCard {
    title: string;
    freq: string;
    desc: string;
    level: string;
    bgColor: string;
    accentColor: string;
}

const WORKOUTS: Record<Goal, WorkoutCard[]> = {
    perda_de_peso: [
        {
            title: 'HIIT + Cardio',
            freq: '4x na semana · 30–40 min',
            desc: 'Alta queima calórica com intervalos de alta intensidade.',
            level: 'Intermediário',
            bgColor: '#7F1D1D',
            accentColor: '#F87171',
        },
        {
            title: 'Circuito Funcional',
            freq: '3x na semana · 45 min',
            desc: 'Movimentos compostos para acelerar o metabolismo.',
            level: 'Iniciante',
            bgColor: '#7C2D12',
            accentColor: '#FB923C',
        },
        {
            title: 'Caminhada + Core',
            freq: '5x na semana · 40 min',
            desc: 'Baixo impacto com foco em queima de gordura contínua.',
            level: 'Iniciante',
            bgColor: '#064E3B',
            accentColor: '#34D399',
        },
    ],
    ganho_de_massa: [
        {
            title: 'Push / Pull / Legs',
            freq: '6x na semana · 60 min',
            desc: 'Divisão clássica para hipertrofia máxima.',
            level: 'Avançado',
            bgColor: '#1E3A5F',
            accentColor: '#60A5FA',
        },
        {
            title: 'Full Body Pesado',
            freq: '3x na semana · 60 min',
            desc: 'Foco em compostos: agachamento, terra, supino.',
            level: 'Intermediário',
            bgColor: '#1E1B4B',
            accentColor: '#A78BFA',
        },
        {
            title: 'Upper / Lower Split',
            freq: '4x na semana · 55 min',
            desc: 'Alternância superior/inferior para volume alto.',
            level: 'Intermediário',
            bgColor: '#14213D',
            accentColor: '#818CF8',
        },
    ],
    manutencao: [
        {
            title: 'Full Body – Intermediário',
            freq: '3x na semana · 45 min',
            desc: 'Agachamento, supino, remada, core.',
            level: 'Intermediário',
            bgColor: '#1E293B',
            accentColor: '#94A3B8',
        },
        {
            title: 'Treino ABC',
            freq: '3x na semana · 50 min',
            desc: 'Divisão A/B/C com volume moderado e consistente.',
            level: 'Intermediário',
            bgColor: '#162032',
            accentColor: '#7DD3FC',
        },
        {
            title: 'Mobilidade + Força',
            freq: '3x na semana · 40 min',
            desc: 'Equilíbrio entre força e flexibilidade.',
            level: 'Iniciante',
            bgColor: '#14532D',
            accentColor: '#4ADE80',
        },
    ],
};

export default function WorkoutsScreen() {
    const router = useRouter();
    const { top } = useSafeAreaInsets();
    const { user } = useAuth();
    const [activeGoal, setActiveGoal] = useState<Goal>('manutencao');
    const [loadingGoal, setLoadingGoal] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoadingGoal(false);
            return;
        }
        const ref = doc(db, 'users', user.uid, 'profile', 'data');
        getDoc(ref).then((snap) => {
            if (snap.exists() && snap.data().goal) {
                setActiveGoal(snap.data().goal as Goal);
            }
        }).finally(() => setLoadingGoal(false));
    }, [user]);

    const workouts = WORKOUTS[activeGoal];

    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            {/* ── HEADER GRADIENTE ── */}
            <LinearGradient
                colors={['#0F172A', '#1E3A5F', '#1E1B4B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.heroGradient, { paddingTop: top + 20 }]}
            >
                <Text style={styles.heroLabel}>TREINOS PARA</Text>
                {loadingGoal ? (
                    <ActivityIndicator color="#FFFFFF" style={{ marginVertical: 8 }} />
                ) : (
                    <Text style={styles.heroGoal}>{GOAL_LABELS[activeGoal]}</Text>
                )}
                <Text style={styles.heroSub}>
                    Escolha um foco e gere um plano personalizado com IA
                </Text>

                {/* Chips de objetivo */}
                <View style={styles.chipRow}>
                    {GOALS.map(({ key, label, emoji }) => (
                        <TouchableOpacity
                            key={key}
                            style={[styles.chip, activeGoal === key && styles.chipActive]}
                            onPress={() => setActiveGoal(key)}
                        >
                            <Text style={styles.chipEmoji}>{emoji}</Text>
                            <Text style={[styles.chipText, activeGoal === key && styles.chipTextActive]}>
                                {label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </LinearGradient>

            {/* ── CARDS DE TREINO ── */}
            <View style={styles.cardsSection}>
                {workouts.map((w) => (
                    <View key={w.title} style={[styles.card, { backgroundColor: w.bgColor }]}>
                        {/* Top accent line */}
                        <View style={[styles.cardAccent, { backgroundColor: w.accentColor }]} />

                        {/* Badges */}
                        <View style={styles.badgeRow}>
                            <View style={[styles.badge, { borderColor: w.accentColor + '55', backgroundColor: w.accentColor + '22' }]}>
                                <Text style={[styles.badgeText, { color: w.accentColor }]}>{w.level}</Text>
                            </View>
                            <View style={[styles.badge, { borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.07)' }]}>
                                <Text style={styles.badgeTextMuted}>{w.freq.split('·')[1]?.trim() ?? ''}</Text>
                            </View>
                        </View>

                        <Text style={styles.cardTitle}>{w.title}</Text>
                        <Text style={styles.cardFreq}>{w.freq.split('·')[0].trim()}</Text>
                        <Text style={styles.cardDesc}>{w.desc}</Text>

                        {/* Botão gradiente */}
                        <TouchableOpacity
                            onPress={() =>
                                router.push({
                                    pathname: '/tools/workout-generator',
                                    params: { goal: activeGoal },
                                })
                            }
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={['#2563EB', '#7C3AED']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.cardBtn}
                            >
                                <Text style={styles.cardBtnText}>Gerar treino personalizado →</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { backgroundColor: '#F8FAFC', paddingBottom: 40 },

    // Hero
    heroGradient: {
        paddingHorizontal: 18,
        paddingBottom: 28,
    },
    heroLabel: {
        color: 'rgba(255,255,255,0.45)',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom: 6,
    },
    heroGoal: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: -1,
        marginBottom: 6,
    },
    heroSub: {
        color: 'rgba(255,255,255,0.55)',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 20,
        lineHeight: 18,
    },
    chipRow: {
        flexDirection: 'row',
        gap: 8,
    },
    chip: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 6,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        gap: 4,
    },
    chipActive: {
        backgroundColor: 'rgba(37,99,235,0.35)',
        borderColor: '#60A5FA',
    },
    chipEmoji: {
        fontSize: 18,
    },
    chipText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 11,
        fontWeight: '700',
        textAlign: 'center',
    },
    chipTextActive: {
        color: '#FFFFFF',
    },

    // Cards
    cardsSection: {
        padding: 18,
        gap: 14,
    },
    card: {
        borderRadius: 20,
        padding: 18,
        overflow: 'hidden',
    },
    cardAccent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
        marginTop: 6,
    },
    badge: {
        borderRadius: 8,
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderWidth: 1,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '800',
    },
    badgeTextMuted: {
        fontSize: 11,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.5)',
    },
    cardTitle: {
        color: '#FFFFFF',
        fontSize: 19,
        fontWeight: '900',
        letterSpacing: -0.4,
        marginBottom: 4,
    },
    cardFreq: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 6,
    },
    cardDesc: {
        color: 'rgba(255,255,255,0.65)',
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 16,
    },
    cardBtn: {
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
    },
    cardBtnText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '800',
    },
});
