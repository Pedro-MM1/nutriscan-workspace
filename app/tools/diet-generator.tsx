import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

type Goal = 'cutting' | 'maintenance' | 'bulking';

export default function DietGeneratorScreen() {
    const [goal, setGoal] = useState<Goal>('maintenance');
    const [calories, setCalories] = useState('2000');
    const [meals, setMeals] = useState('4');
    const [result, setResult] = useState<string | null>(null);

    function generateDiet() {
        const kcal = Number(calories) || 2000;
        const nMeals = Number(meals) || 4;

        let title = '';
        let description = '';

        if (goal === 'cutting') {
            title = 'Plano de Déficit Calórico';
            description =
                'Foco em reduzir gordura mantendo massa magra. Priorize proteínas em todas as refeições, carboidratos mais concentrados em torno do treino e gorduras boas em pequenas quantidades.';
        } else if (goal === 'bulking') {
            title = 'Plano de Ganho de Massa';
            description =
                'Superávit calórico controlado, priorizando fontes limpas. Inclua carboidratos complexos em quase todas as refeições, proteínas constantes e gorduras boas para suporte hormonal.';
        } else {
            title = 'Plano de Manutenção';
            description =
                'Equilíbrio entre energia e saciedade. Distribua carboidratos de forma uniforme ao longo do dia, com boa presença de fibras, proteínas moderadas e gorduras saudáveis.';
        }

        const kcalPerMeal = Math.round(kcal / nMeals);

        setResult(
            `${title}\n\n` +
            `• Meta calórica diária: ~${kcal} kcal\n` +
            `• Refeições por dia: ${nMeals} (≈ ${kcalPerMeal} kcal/refeição)\n\n` +
            `Sugestão de estrutura:\n` +
            `• Café da manhã: fonte de proteína + carboidrato complexo + fruta\n` +
            `• Almoço: metade do prato com vegetais, 1/4 proteína, 1/4 carboidrato\n` +
            `• Lanche: fruta + oleaginosas ou iogurte proteico\n` +
            `• Jantar: refeição mais leve, com foco em proteína e vegetais\n\n` +
            description
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Gerador de Dieta</Text>
                <Text style={styles.subtitle}>
                    Defina sua meta, calorias estimadas e quantidade de refeições. O NutriScan monta uma
                    estrutura de plano alimentar para você.
                </Text>

                <Text style={styles.sectionLabel}>Meta principal</Text>
                <View style={styles.chipRow}>
                    <GoalChip
                        label="Perder gordura"
                        selected={goal === 'cutting'}
                        onPress={() => setGoal('cutting')}
                    />
                    <GoalChip
                        label="Manter peso"
                        selected={goal === 'maintenance'}
                        onPress={() => setGoal('maintenance')}
                    />
                    <GoalChip
                        label="Ganhar massa"
                        selected={goal === 'bulking'}
                        onPress={() => setGoal('bulking')}
                    />
                </View>

                <Text style={styles.sectionLabel}>Calorias diárias (estimativa)</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="Ex: 2000"
                    placeholderTextColor="#6B7280"
                    value={calories}
                    onChangeText={setCalories}
                />

                <Text style={styles.sectionLabel}>Quantidade de refeições por dia</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="Ex: 4"
                    placeholderTextColor="#6B7280"
                    value={meals}
                    onChangeText={setMeals}
                />

                <TouchableOpacity style={styles.primaryBtn} onPress={generateDiet}>
                    <Text style={styles.primaryBtnText}>Gerar plano</Text>
                </TouchableOpacity>

                {result && (
                    <View style={styles.resultCard}>
                        <Text style={styles.resultText}>{result}</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

function GoalChip({
    label,
    selected,
    onPress,
}: {
    label: string;
    selected: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            style={[
                styles.chip,
                selected && { backgroundColor: Colors.light.primary + '22', borderColor: Colors.light.primary },
            ]}
            onPress={onPress}
        >
            <Text
                style={[
                    styles.chipText,
                    selected && { color: Colors.light.primary, fontWeight: '600' },
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        marginBottom: 16,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.text,
        marginTop: 12,
        marginBottom: 6,
    },
    chipRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    chip: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: Colors.light.border,
        backgroundColor: Colors.light.card,
    },
    chipText: {
        fontSize: 13,
        color: '#D1D5DB',
    },
    input: {
        backgroundColor: Colors.light.card,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: Colors.light.border,
        color: Colors.light.text,
        fontSize: 14,
    },
    primaryBtn: {
        marginTop: 16,
        backgroundColor: Colors.light.primary,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    resultCard: {
        marginTop: 18,
        backgroundColor: Colors.light.card,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    resultText: {
        color: '#E5E7EB',
        fontSize: 14,
        lineHeight: 20,
    },
});
