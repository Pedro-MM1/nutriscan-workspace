import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

export default function PrivacyScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Privacidade</Text>
                <Text style={styles.subtitle}>
                    Um resumo da forma como o NutriScan lida com seus dados. Você pode ajustar isso
                    quando oficializarmos a política completa.
                </Text>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Dados que coletamos</Text>
                    <Text style={styles.cardText}>
                        • Dados de conta (nome, e-mail){'\n'}
                        • Dados de uso do app (scans, planos de dieta/treino, anotações){'\n'}
                        • Informações opcionais de perfil (peso, altura, objetivo)
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Como usamos esses dados</Text>
                    <Text style={styles.cardText}>
                        • Personalizar seu dashboard e planos{'\n'}
                        • Gerar insights de evolução{'\n'}
                        • Oferecer recomendações mais relevantes via IA
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Seus controles</Text>
                    <Text style={styles.cardText}>
                        • Você poderá solicitar remoção completa dos dados{'\n'}
                        • Exportar um resumo da sua conta{'\n'}
                        • Ajustar o que é usado para treinar recomendações
                    </Text>
                </View>

                <Text style={styles.footerText}>
                    Essa tela é um rascunho funcional. Quando formos lançar o app para produção,
                    podemos colar aqui o texto final da política de privacidade e os links legais
                    necessários (LGPD etc.).
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    scroll: {
        padding: 16,
        paddingBottom: 24,
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
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: Colors.light.border,
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 6,
    },
    cardText: {
        fontSize: 13,
        color: '#E5E7EB',
        lineHeight: 18,
    },
    footerText: {
        marginTop: 8,
        fontSize: 12,
        color: '#9CA3AF',
    },
});
