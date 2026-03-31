import React, { useMemo, useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type MealDraft = {
    name: string;
    kcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    type?: "breakfast" | "lunch" | "dinner" | "snack";
};

type Props = {
    visible: boolean;
    onClose: () => void;
    onSubmit: (meal: MealDraft) => Promise<void> | void;
};

const TYPES: { key: MealDraft["type"]; label: string; emoji: string }[] = [
    { key: "breakfast", label: "Café", emoji: "☕️" },
    { key: "lunch", label: "Almoço", emoji: "🍛" },
    { key: "dinner", label: "Jantar", emoji: "🍽️" },
    { key: "snack", label: "Lanche", emoji: "🍎" },
];

function toNumberSafe(v: string) {
    const n = Number(String(v).replace(",", "."));
    return Number.isFinite(n) ? n : 0;
}

export default function AddMealModal({ visible, onClose, onSubmit }: Props) {
    const [type, setType] = useState<MealDraft["type"]>("lunch");
    const [name, setName] = useState("");
    const [kcal, setKcal] = useState("");
    const [proteinG, setProteinG] = useState("");
    const [carbsG, setCarbsG] = useState("");
    const [fatG, setFatG] = useState("");
    const [saving, setSaving] = useState(false);

    const disabled = useMemo(() => {
        if (!name.trim()) return true;
        if (saving) return true;
        return toNumberSafe(kcal) <= 0;
    }, [name, kcal, saving]);

    async function handleSave() {
        if (disabled) return;

        try {
            setSaving(true);

            await onSubmit({
                name: name.trim(),
                kcal: toNumberSafe(kcal),
                proteinG: toNumberSafe(proteinG),
                carbsG: toNumberSafe(carbsG),
                fatG: toNumberSafe(fatG),
                type,
            });

            // reset local
            setName("");
            setKcal("");
            setProteinG("");
            setCarbsG("");
            setFatG("");
            setType("lunch");
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.65)" }} />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}
            >
                <View
                    style={{
                        backgroundColor: "#0B1220",
                        borderTopLeftRadius: 22,
                        borderTopRightRadius: 22,
                        borderWidth: 1,
                        borderColor: "#111827",
                        padding: 16,
                    }}
                >
                    {/* Header */}
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <View>
                            <Text style={{ color: "#F9FAFB", fontWeight: "900", fontSize: 16 }}>
                                Adicionar refeição
                            </Text>
                            <Text style={{ color: "#9CA3AF", marginTop: 2, fontSize: 12 }}>
                                Registrar manualmente
                            </Text>
                        </View>

                        <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
                            <Text style={{ color: "#9CA3AF", fontWeight: "900" }}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Type chips */}
                    <View style={{ flexDirection: "row", gap: 8, marginTop: 12, marginBottom: 12, flexWrap: "wrap" }}>
                        {TYPES.map((t) => {
                            const active = t.key === type;
                            return (
                                <TouchableOpacity
                                    key={String(t.key)}
                                    onPress={() => setType(t.key)}
                                    style={{
                                        paddingVertical: 8,
                                        paddingHorizontal: 10,
                                        borderRadius: 999,
                                        borderWidth: 1,
                                        borderColor: active ? "#22C55E" : "#111827",
                                        backgroundColor: active ? "rgba(34,197,94,0.15)" : "#050B16",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 6,
                                    }}
                                >
                                    <Text style={{ color: active ? "#86EFAC" : "#9CA3AF", fontWeight: "900" }}>
                                        {t.emoji}
                                    </Text>
                                    <Text style={{ color: active ? "#F9FAFB" : "#9CA3AF", fontWeight: "900", fontSize: 12 }}>
                                        {t.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Inputs */}
                    <Label>Nome</Label>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="Ex.: Arroz + frango"
                        placeholderTextColor="#6B7280"
                        style={inputStyle}
                    />

                    <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                        <View style={{ flex: 1 }}>
                            <Label>kcal</Label>
                            <TextInput value={kcal} onChangeText={setKcal} keyboardType="numeric" style={inputStyle} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Label>Proteína (g)</Label>
                            <TextInput value={proteinG} onChangeText={setProteinG} keyboardType="numeric" style={inputStyle} />
                        </View>
                    </View>

                    <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                        <View style={{ flex: 1 }}>
                            <Label>Carbo (g)</Label>
                            <TextInput value={carbsG} onChangeText={setCarbsG} keyboardType="numeric" style={inputStyle} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Label>Gordura (g)</Label>
                            <TextInput value={fatG} onChangeText={setFatG} keyboardType="numeric" style={inputStyle} />
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
                        <TouchableOpacity
                            onPress={onClose}
                            style={{
                                flex: 1,
                                backgroundColor: "#050B16",
                                borderWidth: 1,
                                borderColor: "#111827",
                                paddingVertical: 14,
                                borderRadius: 14,
                                alignItems: "center",
                            }}
                        >
                            <Text style={{ color: "#9CA3AF", fontWeight: "900" }}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={disabled}
                            style={{
                                flex: 1,
                                backgroundColor: disabled ? "#14532D" : "#22C55E",
                                paddingVertical: 14,
                                borderRadius: 14,
                                alignItems: "center",
                                opacity: disabled ? 0.6 : 1,
                            }}
                        >
                            <Text style={{ color: "#022C22", fontWeight: "900" }}>
                                {saving ? "Salvando..." : "Salvar"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 10 }} />
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

function Label({ children }: { children: string }) {
    return (
        <Text style={{ color: "#9CA3AF", fontSize: 12, fontWeight: "800", marginBottom: 6 }}>
            {children}
        </Text>
    );
}

const inputStyle = {
    backgroundColor: "#050B16",
    borderWidth: 1,
    borderColor: "#111827",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    color: "#F9FAFB",
    fontWeight: "800" as const,
};
