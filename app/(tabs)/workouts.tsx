import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { db } from '../../lib/firebase';
import { useAuth } from '../../services/auth';

type Goal = 'perda_de_peso' | 'ganho_de_massa' | 'manutencao';

const GOALS: { key: Goal; label: string; emoji: string }[] = [
    { key: 'perda_de_peso', label: 'Emagrecimento', emoji: '🔥' },
    { key: 'ganho_de_massa', label: 'Hipertrofia', emoji: '💪' },
    { key: 'manutencao', label: 'Manutenção', emoji: '⚖️' },
];

interface WorkoutCard {
    title: string;
    freq: string;
    desc: string;
}

const WORKOUTS: Record<Goal, WorkoutCard[]> = {
    perda_de_peso: [
        {
            title: 'HIIT + Cardio',
            freq: '4x na semana · 30–40 min',
            desc: 'Alta queima calórica com intervalos de alta intensidade.',
        },
        {
            title: 'Circuito Funcional',
            freq: '3x na semana · 45 min',
            desc: 'Movimentos compostos para acelerar o metabolismo.',
        },
        {
            title: 'Caminhada + Core',
            freq: '5x na semana · 40 min',
            desc: 'Baixo impacto com foco em queima de gordura contínua.',
        },
    ],
    ganho_de_massa: [
        {
            title: 'Push / Pull / Legs',
            freq: '6x na semana · 60 min',
            desc: 'Divisão clássica para hipertrofia máxima.',
        },
        {
            title: 'Full Body Pesado',
            freq: '3x na semana · 60 min',
            desc: 'Foco em compostos: agachamento, terra, supino.',
        },
        {
            title: 'Upper / Lower Split',
            freq: '4x na semana · 55 min',
            desc: 'Alternância superior/inferior para volume alto.',
        },
    ],
    manutencao: [
        {
            title: 'Full Body – Intermediário',
            freq: '3x na semana · 45 min',
            desc: 'Agachamento, supino, remada, core.',
        },
        {
            title: 'Treino ABC',
            freq: '3x na semana · 50 min',
            desc: 'Divisão A/B/C com volume moderado e consistente.',
        },
        {
            title: 'Mobilidade + Força',
            freq: '3x na semana · 40 min',
            desc: 'Equilíbrio entre força e flexibilidade.',
        },
    ],
};

export default function WorkoutsScreen() {
    const router = useRouter();
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
        <ScrollView contentContainerStyle={styles.container}>
            <Image
                source={require('../../assets/images/workout-strong.jpg')}
                style={styles.heroImage}
            />

            <Text style={styles.title}>Treinos recomendados</Text>
            <Text style={styles.text}>
                Escolha um foco e o NutriScan AI vai sugerir treinos alinhados com sua meta.
            </Text>

            {loadingGoal ? (
                <ActivityIndicator color={Colors.light.primary} style={{ marginBottom: 16 }} />
            ) : (
                <View style={styles.chipRow}>
                    {GOALS.map(({ key, label, emoji }) => (
                        <TouchableOpacity
                            key={key}
                            style={[styles.chip, activeGoal === key && styles.chipActive]}
                            onPress={() => setActiveGoal(key)}
                        >
                            <Text style={[styles.chipText, activeGoal === key && styles.chipTextActive]}>
                                {emoji} {label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {workouts.map((w) => (
                <View key={w.title} style={styles.card}>
                    <Text style={styles.cardTitle}>{w.title}</Text>
                    <Text style={styles.cardFreq}>{w.freq}</Text>
                    <Text style={styles.cardDesc}>{w.desc}</Text>
                    <TouchableOpacity
                        style={styles.cardButton}
                        onPress={() =>
                            router.push({
                                pathname: '/tools/workout-generator',
                                params: { goal: activeGoal },
                            })
                        }
                    >
                        <Text style={styles.cardButtonText}>Gerar treino personalizado →</Text>
                    </TouchableOpacity>
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, paddingBottom: 40 },
    heroImage: {
        width: '100%',
        height: 180,
        borderRadius: 18,
        marginBottom: 16,
    },
    title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
    text: { fontSize: 14, color: '#4B5563', marginBottom: 12 },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: '#111827',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    chipActive: {
        backgroundColor: Colors.light.primary + '22',
        borderColor: Colors.light.primary,
    },
    chipText: {
        color: '#F9FAFB',
        fontSize: 12,
        fontWeight: '500',
    },
    chipTextActive: {
        color: Colors.light.primary,
        fontWeight: '700',
    },
    card: {
        backgroundColor: '#111827',
        padding: 14,
        borderRadius: 16,
        marginBottom: 12,
    },
    cardTitle: {
        color: '#F9FAFB',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    cardFreq: {
        color: '#9CA3AF',
        fontSize: 13,
        marginBottom: 2,
    },
    cardDesc: {
        color: '#9CA3AF',
        fontSize: 13,
        marginBottom: 12,
    },
    cardButton: {
        backgroundColor: Colors.light.primary,
        borderRadius: 10,
        paddingVertical: 9,
        alignItems: 'center',
    },
    cardButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
    },
});
