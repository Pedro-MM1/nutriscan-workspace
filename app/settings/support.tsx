import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

export default function SupportScreen() {
    function openEmail() {
        Linking.openURL('mailto:suporte@nutriscan.app?subject=Ajuda%20com%20o%20app');
    }

    function openWhats() {
        // placeholder – depois você coloca o número oficial
        Linking.openURL('https://wa.me/5500000000000');
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Ajuda & suporte</Text>
            <Text style={styles.subtitle}>
                Teve algum problema ou tem uma sugestão? Fale com a gente ou consulte as dúvidas mais comuns.
            </Text>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Canais de contato</Text>

                <TouchableOpacity style={styles.row} onPress={openEmail}>
                    <View style={styles.rowLeft}>
                        <FontAwesome name="envelope-o" size={18} color="#E5E7EB" />
                        <View>
                            <Text style={styles.rowLabel}>E-mail de suporte</Text>
                            <Text style={styles.rowSub}>suporte@nutriscan.app</Text>
                        </View>
                    </View>
                    <FontAwesome name="chevron-right" size={12} color="#6B7280" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.row} onPress={openWhats}>
                    <View style={styles.rowLeft}>
                        <FontAwesome name="whatsapp" size={18} color="#22C55E" />
                        <View>
                            <Text style={styles.rowLabel}>WhatsApp</Text>
                            <Text style={styles.rowSub}>Atendimento em horário comercial</Text>
                        </View>
                    </View>
                    <FontAwesome name="chevron-right" size={12} color="#6B7280" />
                </TouchableOpacity>
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>FAQ rápido</Text>
                <Text style={styles.faqItem}>
                    • Como cancelar a assinatura?{'\n'}
                    → Acesse "Pagamento & assinatura" e toque em "Gerenciar assinatura".
                </Text>
                <Text style={styles.faqItem}>
                    • Meus dados ficam salvos pra sempre?{'\n'}
                    → Você poderá solicitar remoção completa quando a conta sair da versão beta.
                </Text>
                <Text style={styles.faqItem}>
                    • A IA substitui um nutricionista?{'\n'}
                    → Não. Ela oferece apoio e educação, mas não substitui acompanhamento profissional.
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
        padding: 14,
        borderWidth: 1,
        borderColor: Colors.light.border,
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    rowLabel: {
        fontSize: 14,
        color: '#E5E7EB',
    },
    rowSub: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    faqItem: {
        fontSize: 13,
        color: '#E5E7EB',
        marginBottom: 6,
        lineHeight: 18,
    },
});
