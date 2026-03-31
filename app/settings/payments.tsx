import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

export default function PaymentsScreen() {
    const currentPlan = 'Plano Full';
    const renewsAt = '10/01/2026';

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Pagamento & assinatura</Text>
            <Text style={styles.subtitle}>
                Veja seu plano atual, forma de pagamento e opções para gerenciar sua assinatura.
            </Text>

            <View style={styles.card}>
                <Text style={styles.sectionLabel}>Plano atual</Text>
                <View style={styles.row}>
                    <View>
                        <Text style={styles.planName}>{currentPlan}</Text>
                        <Text style={styles.planInfo}>Renova em {renewsAt}</Text>
                    </View>
                    <View style={styles.planBadge}>
                        <FontAwesome name="star" size={12} color="#FFD60A" />
                        <Text style={styles.planBadgeText}>Ativo</Text>
                    </View>
                </View>

                <Text style={styles.sectionLabel}>Forma de pagamento</Text>
                <View style={styles.row}>
                    <View>
                        <Text style={styles.paymentText}>Cartão de crédito</Text>
                        <Text style={styles.paymentSub}>Gerenciado pela loja de apps (Apple/Google).</Text>
                    </View>
                </View>

                <Link href="/subscription" asChild>
                    <TouchableOpacity style={styles.primaryBtn}>
                        <Text style={styles.primaryBtnText}>Gerenciar assinatura</Text>
                    </TouchableOpacity>
                </Link>

                <Text style={styles.footerText}>
                    Em produção, essa tela pode ser integrada com o sistema de billing que você escolher
                    (loja, Stripe, Mercado Pago etc.). Aqui ela já organiza o fluxo visual para o usuário.
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
        padding: 16,
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
    card: {
        backgroundColor: Colors.light.card,
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    sectionLabel: {
        fontSize: 13,
        color: '#9CA3AF',
        marginTop: 8,
        marginBottom: 4,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    planName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    planInfo: {
        fontSize: 13,
        color: '#9CA3AF',
    },
    planBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#FFD60A40',
        backgroundColor: '#1C1C1E',
    },
    planBadgeText: {
        fontSize: 11,
        color: '#FFD60A',
        fontWeight: '600',
    },
    paymentText: {
        fontSize: 14,
        color: '#E5E7EB',
    },
    paymentSub: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    primaryBtn: {
        marginTop: 12,
        backgroundColor: Colors.light.primary,
        paddingVertical: 12,
        borderRadius: 14,
        alignItems: 'center',
    },
    primaryBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    footerText: {
        marginTop: 10,
        fontSize: 12,
        color: '#9CA3AF',
    },
});
