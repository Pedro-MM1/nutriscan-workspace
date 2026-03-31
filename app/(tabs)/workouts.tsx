import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WorkoutsScreen() {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image
                source={require('../../assets/images/workout-strong.jpg')}
                style={styles.heroImage}
            />

            <Text style={styles.title}>Treinos recomendados</Text>
            <Text style={styles.text}>
                Escolha um foco e o NutriScan AI vai sugerir treinos alinhados com sua meta
                (emagrecimento, hipertrofia ou manutenção).
            </Text>

            <View style={styles.chipRow}>
                <TouchableOpacity style={styles.chip}>
                    <Text style={styles.chipText}>🔥 Emagrecimento</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.chip}>
                    <Text style={styles.chipText}>💪 Hipertrofia</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.chip}>
                    <Text style={styles.chipText}>⚖️ Manutenção</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Treino Full Body – Iniciante</Text>
                <Text style={styles.cardText}>3x na semana · 45 min</Text>
                <Text style={styles.cardText}>Agachamento, supino, remada, core.</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Push/Pull/Legs – Intermediário</Text>
                <Text style={styles.cardText}>6x na semana · 60 min</Text>
                <Text style={styles.cardText}>Foco em hipertrofia com divisão clássica.</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>HIIT + Caminhada</Text>
                <Text style={styles.cardText}>4x na semana · 30–40 min</Text>
                <Text style={styles.cardText}>Alta queima calórica em pouco tempo.</Text>
            </View>
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
    },
    chipText: {
        color: '#F9FAFB',
        fontSize: 12,
        fontWeight: '500',
    },
    card: {
        backgroundColor: '#111827',
        padding: 14,
        borderRadius: 16,
        marginBottom: 10,
    },
    cardTitle: {
        color: '#F9FAFB',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    cardText: {
        color: '#9CA3AF',
        fontSize: 13,
    },
});
