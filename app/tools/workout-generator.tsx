import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";

type Focus = "fullbody" | "upper" | "lower";

export default function WorkoutGeneratorScreen() {
    const [focus, setFocus] = useState<Focus>("fullbody");
    const [days, setDays] = useState("3");
    const [place, setPlace] = useState<"gym" | "home">("gym");
    const [result, setResult] = useState<string | null>(null);

    function generateWorkout() {
        const nDays = Number(days) || 3;

        let title = "";
        if (focus === "fullbody") title = "Treino Full Body";
        if (focus === "upper") title = "Treino Foco Membros Superiores";
        if (focus === "lower") title = "Treino Foco Pernas e Glúteos";

        const locationText =
            place === "gym"
                ? "Pensado para academia, usando máquinas e pesos livres."
                : "Pensado para casa, usando peso do corpo e poucos equipamentos.";

        setResult(
            `${title}\n\n` +
            `• Dias de treino por semana: ${nDays}\n` +
            `• Local: ${place === "gym" ? "Academia" : "Casa"}\n\n` +
            `Sugestão de divisão:\n` +
            (focus === "fullbody"
                ? `• Dia A: Agachamento, Supino, Remada, Desenvolvimento, Abdômen\n` +
                `• Dia B: Terra romeno, Barra fixa ou puxada, Flexão, Elevação lateral, Core\n` +
                `• Dia C: Varie intensidade, priorizando movimentos compostos`
                : focus === "upper"
                    ? `• Dia A: Peito + Tríceps\n• Dia B: Costas + Bíceps\n• Dia C: Ombros + Core`
                    : `• Dia A: Quadríceps + Glúteos\n• Dia B: Posterior + Glúteos\n• Dia C: Pernas completas + Core`) +
            `\n\n${locationText}\n\n` +
            `Lembre-se: ajuste cargas, repetições e descanso conforme seu nível e, se possível, com orientação profissional.`
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Gerador de Treino</Text>
                <Text style={styles.subtitle}>
                    Escolha foco, quantidade de dias e local. O NutriScan sugere uma divisão
                    de treinos.
                </Text>

                <Text style={styles.sectionLabel}>Foco principal</Text>
                <View style={styles.chipRow}>
                    <Chip
                        label="Full body"
                        selected={focus === "fullbody"}
                        onPress={() => setFocus("fullbody")}
                    />
                    <Chip
                        label="Parte de cima"
                        selected={focus === "upper"}
                        onPress={() => setFocus("upper")}
                    />
                    <Chip
                        label="Pernas/Glúteos"
                        selected={focus === "lower"}
                        onPress={() => setFocus("lower")}
                    />
                </View>

                <Text style={styles.sectionLabel}>Dias de treino por semana</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="Ex: 3"
                    placeholderTextColor="#6B7280"
                    value={days}
                    onChangeText={setDays}
                />

                <Text style={styles.sectionLabel}>Onde você treina?</Text>
                <View style={styles.chipRow}>
                    <Chip
                        label="Academia"
                        selected={place === "gym"}
                        onPress={() => setPlace("gym")}
                    />
                    <Chip
                        label="Casa"
                        selected={place === "home"}
                        onPress={() => setPlace("home")}
                    />
                </View>

                <TouchableOpacity style={styles.primaryBtn} onPress={generateWorkout}>
                    <Text style={styles.primaryBtnText}>Gerar treino</Text>
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

function Chip({
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
                selected && {
                    backgroundColor: Colors.light.primary + "22",
                    borderColor: Colors.light.primary,
                },
            ]}
            onPress={onPress}
        >
            <Text
                style={[
                    styles.chipText,
                    selected && { color: Colors.light.primary, fontWeight: "600" },
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
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: "#9CA3AF",
        marginBottom: 16,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.light.text,
        marginTop: 12,
        marginBottom: 6,
    },
    chipRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 8,
        flexWrap: "wrap",
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
        color: "#D1D5DB",
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
        alignItems: "center",
        justifyContent: "center",
    },
    primaryBtnText: {
        color: "#fff",
        fontWeight: "600",
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
        color: "#E5E7EB",
        fontSize: 14,
        lineHeight: 20,
    },
});
