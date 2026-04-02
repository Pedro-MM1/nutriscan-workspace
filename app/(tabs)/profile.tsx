import { doc, getDoc, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { db } from "../../lib/firebase";
import { useAuth } from "../../services/auth";

type Goal = "perda_de_peso" | "ganho_de_massa" | "manutencao";

const GOAL_LABELS: Record<Goal, string> = {
    perda_de_peso: "Perda de peso",
    ganho_de_massa: "Ganho de massa",
    manutencao: "Manutenção",
};

const GOALS: Goal[] = ["perda_de_peso", "ganho_de_massa", "manutencao"];

export default function ProfileScreen() {
    const router = useRouter();
    const { signOut, user } = useAuth();

    const [goal, setGoal] = useState<Goal | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [editName, setEditName] = useState("");
    const [editGoal, setEditGoal] = useState<Goal>("manutencao");
    const [saving, setSaving] = useState(false);

    const displayName = user?.displayName || user?.email?.split("@")[0] || "Usuário";
    const avatarLetter = displayName.charAt(0).toUpperCase();

    useEffect(() => {
        if (!user) return;
        const ref = doc(db, "users", user.uid, "profile", "data");
        getDoc(ref).then((snap) => {
            if (snap.exists()) {
                const data = snap.data();
                if (data.goal) setGoal(data.goal as Goal);
            }
        });
    }, [user]);

    const openModal = () => {
        setEditName(user?.displayName ?? "");
        setEditGoal(goal ?? "manutencao");
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            if (editName.trim() && editName.trim() !== user.displayName) {
                await updateProfile(user, { displayName: editName.trim() });
            }
            await setDoc(
                doc(db, "users", user.uid, "profile", "data"),
                { goal: editGoal },
                { merge: true }
            );
            setGoal(editGoal);
            setModalVisible(false);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        router.replace("/(auth)/login");
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{avatarLetter}</Text>
                </View>
                <Text style={styles.name}>{displayName}</Text>
                <Text style={styles.email}>{user?.email ?? "Seu perfil e preferências"}</Text>
                {goal && (
                    <View style={styles.goalBadge}>
                        <Text style={styles.goalBadgeText}>{GOAL_LABELS[goal]}</Text>
                    </View>
                )}
            </View>

            <Text style={styles.sectionTitle}>Conta</Text>

            <TouchableOpacity style={styles.settingsItem} onPress={openModal}>
                <View>
                    <Text style={styles.itemTitle}>Editar perfil</Text>
                    <Text style={styles.itemSub}>Nome, objetivo e dados pessoais</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingsItem}>
                <View>
                    <Text style={styles.itemTitle}>Metas diárias</Text>
                    <Text style={styles.itemSub}>Calorias e macros</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.settingsItem}
                onPress={() => router.push("/subscription")}
            >
                <View>
                    <Text style={styles.itemTitle}>Plano</Text>
                    <Text style={styles.itemSub}>Basic ou Full</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Preferências</Text>

            <TouchableOpacity
                style={styles.settingsItem}
                onPress={() => router.push("/settings/notifications")}
            >
                <View>
                    <Text style={styles.itemTitle}>Notificações</Text>
                    <Text style={styles.itemSub}>Lembretes e alertas do app</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.settingsItem}
                onPress={() => router.push("/settings/privacy")}
            >
                <View>
                    <Text style={styles.itemTitle}>Privacidade</Text>
                    <Text style={styles.itemSub}>Dados e segurança</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Sair da conta</Text>
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalSheet}>
                        <Text style={styles.modalTitle}>Editar perfil</Text>

                        <Text style={styles.fieldLabel}>Nome</Text>
                        <TextInput
                            style={styles.textInput}
                            value={editName}
                            onChangeText={setEditName}
                            placeholder="Seu nome"
                            placeholderTextColor="#64748B"
                            autoCorrect={false}
                        />

                        <Text style={styles.fieldLabel}>Objetivo</Text>
                        {GOALS.map((g) => (
                            <TouchableOpacity
                                key={g}
                                style={[
                                    styles.goalOption,
                                    editGoal === g && styles.goalOptionSelected,
                                ]}
                                onPress={() => setEditGoal(g)}
                            >
                                <View style={[styles.radio, editGoal === g && styles.radioSelected]} />
                                <Text
                                    style={[
                                        styles.goalOptionText,
                                        editGoal === g && styles.goalOptionTextSelected,
                                    ]}
                                >
                                    {GOAL_LABELS[g]}
                                </Text>
                            </TouchableOpacity>
                        ))}

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setModalVisible(false)}
                                disabled={saving}
                            >
                                <Text style={styles.cancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleSave}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.saveText}>Salvar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 18,
        paddingBottom: 32,
        backgroundColor: Colors.light.background,
    },

    header: {
        alignItems: "center",
        marginTop: 10,
        marginBottom: 24,
    },

    avatar: {
        width: 74,
        height: 74,
        borderRadius: 999,
        backgroundColor: "#DBEAFE",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },

    avatarText: {
        fontSize: 28,
        fontWeight: "900",
        color: "#1D4ED8",
    },

    name: {
        fontSize: 24,
        fontWeight: "900",
        color: Colors.light.text,
        letterSpacing: -0.5,
    },

    email: {
        marginTop: 6,
        fontSize: 13,
        color: "#64748B",
        fontWeight: "600",
    },

    goalBadge: {
        marginTop: 8,
        backgroundColor: "#ECFDF5",
        borderRadius: 99,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: "#6EE7B7",
    },

    goalBadgeText: {
        color: "#065F46",
        fontSize: 12,
        fontWeight: "700",
    },

    sectionTitle: {
        color: Colors.light.text,
        fontSize: 16,
        fontWeight: "900",
        marginBottom: 12,
        marginTop: 10,
    },

    settingsItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderRadius: 18,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },

    itemTitle: {
        color: Colors.light.text,
        fontSize: 15,
        fontWeight: "900",
    },

    itemSub: {
        color: "#64748B",
        fontSize: 12,
        fontWeight: "600",
        marginTop: 4,
    },

    chevron: {
        fontSize: 22,
        color: "#94A3B8",
        fontWeight: "700",
    },

    logoutButton: {
        marginTop: 18,
        backgroundColor: "#FEF2F2",
        borderWidth: 1,
        borderColor: "#FECACA",
        borderRadius: 18,
        paddingVertical: 16,
        alignItems: "center",
    },

    logoutText: {
        color: "#DC2626",
        fontWeight: "900",
        fontSize: 15,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },

    modalSheet: {
        backgroundColor: "#1F2937",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 36,
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: "900",
        color: "#FFFFFF",
        marginBottom: 20,
    },

    fieldLabel: {
        fontSize: 13,
        fontWeight: "700",
        color: "#9CA3AF",
        marginBottom: 8,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },

    textInput: {
        backgroundColor: "#111827",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: "#FFFFFF",
        fontSize: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#374151",
    },

    goalOption: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#374151",
        marginBottom: 8,
        backgroundColor: "#111827",
    },

    goalOptionSelected: {
        borderColor: Colors.light.primary,
        backgroundColor: "#064E3B",
    },

    radio: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: "#6B7280",
        marginRight: 12,
    },

    radioSelected: {
        borderColor: Colors.light.primary,
        backgroundColor: Colors.light.primary,
    },

    goalOptionText: {
        color: "#9CA3AF",
        fontSize: 15,
        fontWeight: "600",
    },

    goalOptionTextSelected: {
        color: "#FFFFFF",
        fontWeight: "700",
    },

    modalActions: {
        flexDirection: "row",
        gap: 12,
        marginTop: 8,
    },

    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#374151",
        alignItems: "center",
    },

    cancelText: {
        color: "#9CA3AF",
        fontWeight: "700",
        fontSize: 15,
    },

    saveButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: Colors.light.primary,
        alignItems: "center",
    },

    saveText: {
        color: "#FFFFFF",
        fontWeight: "900",
        fontSize: 15,
    },
});
