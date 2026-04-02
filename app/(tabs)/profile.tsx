import { doc, getDoc, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { LinearGradient } from "expo-linear-gradient";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
    const { top } = useSafeAreaInsets();
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
            if (snap.exists() && snap.data().goal) {
                setGoal(snap.data().goal as Goal);
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
        <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
        >
            {/* ── HEADER GRADIENTE ── */}
            <LinearGradient
                colors={["#0F172A", "#1E3A5F", "#1E1B4B"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.headerGradient, { paddingTop: top + 24 }]}
            >
                <LinearGradient
                    colors={["#2563EB", "#7C3AED"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.avatar}
                >
                    <Text style={styles.avatarText}>{avatarLetter}</Text>
                </LinearGradient>

                <Text style={styles.name}>{displayName}</Text>
                <Text style={styles.email}>{user?.email ?? "Seu perfil e preferências"}</Text>

                {goal && (
                    <View style={styles.goalBadge}>
                        <Text style={styles.goalBadgeText}>{GOAL_LABELS[goal]}</Text>
                    </View>
                )}

                <TouchableOpacity style={styles.editBtn} onPress={openModal}>
                    <Text style={styles.editBtnText}>Editar perfil</Text>
                </TouchableOpacity>
            </LinearGradient>

            {/* ── SEÇÕES ── */}
            <View style={styles.sections}>
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
            </View>

            {/* ── MODAL ── */}
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
                                style={[styles.goalOption, editGoal === g && styles.goalOptionSelected]}
                                onPress={() => setEditGoal(g)}
                            >
                                <View style={[styles.radio, editGoal === g && styles.radioSelected]} />
                                <Text style={[styles.goalOptionText, editGoal === g && styles.goalOptionTextSelected]}>
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
        backgroundColor: "#F8FAFC",
        paddingBottom: 40,
    },

    // Header gradiente
    headerGradient: {
        alignItems: "center",
        paddingHorizontal: 18,
        paddingBottom: 32,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 14,
        shadowColor: "#7C3AED",
        shadowOpacity: 0.5,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: "900",
        color: "#FFFFFF",
    },
    name: {
        fontSize: 26,
        fontWeight: "900",
        color: "#FFFFFF",
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    email: {
        fontSize: 13,
        color: "rgba(255,255,255,0.55)",
        fontWeight: "600",
        marginBottom: 10,
    },
    goalBadge: {
        backgroundColor: "rgba(255,255,255,0.12)",
        borderRadius: 99,
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
        marginBottom: 16,
    },
    goalBadgeText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "700",
    },
    editBtn: {
        backgroundColor: "rgba(255,255,255,0.15)",
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 9,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.25)",
    },
    editBtnText: {
        color: "#FFFFFF",
        fontWeight: "800",
        fontSize: 13,
    },

    // Seções
    sections: {
        padding: 18,
    },
    sectionTitle: {
        color: "#0F172A",
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
        color: "#0F172A",
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
        marginTop: 8,
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
