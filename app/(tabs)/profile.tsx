import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/Colors";

export default function ProfileScreen() {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>P</Text>
                </View>

                <Text style={styles.name}>Pedro</Text>
                <Text style={styles.email}>Seu perfil e preferências</Text>
            </View>

            <Text style={styles.sectionTitle}>Conta</Text>

            <TouchableOpacity style={styles.settingsItem}>
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

            <TouchableOpacity style={styles.settingsItem}>
                <View>
                    <Text style={styles.itemTitle}>Plano</Text>
                    <Text style={styles.itemSub}>Basic ou Full</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Preferências</Text>

            <TouchableOpacity style={styles.settingsItem}>
                <View>
                    <Text style={styles.itemTitle}>Notificações</Text>
                    <Text style={styles.itemSub}>Lembretes e alertas do app</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingsItem}>
                <View>
                    <Text style={styles.itemTitle}>Privacidade</Text>
                    <Text style={styles.itemSub}>Dados e segurança</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton}>
                <Text style={styles.logoutText}>Sair da conta</Text>
            </TouchableOpacity>
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
});