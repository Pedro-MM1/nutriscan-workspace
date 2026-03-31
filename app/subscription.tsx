import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';

export default function SubscriptionScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Planos NutriScan</Text>
                <Text style={styles.subtitle}>
                    Escolha o plano ideal para o seu momento. Você pode trocar ou cancelar quando quiser.
                </Text>

                {/* Plano Básico */}
                <View style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>Básico</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>Atual</Text>
                        </View>
                    </View>
                    <Text style={styles.price}>R$ 19,90/mês</Text>
                    <Text style={styles.priceSub}>Ideal para começar</Text>

                    <View style={styles.featureRow}>
                        <FontAwesome name="check" size={13} color="#30D158" />
                        <Text style={styles.featureText}>Scanner de alimentos ilimitado</Text>
                    </View>
                    <View style={styles.featureRow}>
                        <FontAwesome name="check" size={13} color="#30D158" />
                        <Text style={styles.featureText}>Dashboard com calorias do dia</Text>
                    </View>
                    <View style={styles.featureRow}>
                        <FontAwesome name="check" size={13} color="#30D158" />
                        <Text style={styles.featureText}>Gerador básico de dieta e treino</Text>
                    </View>
                </View>

                {/* Plano Full */}
                <View style={[styles.card, styles.cardHighlight]}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>Full</Text>
                        <View style={[styles.badge, { backgroundColor: '#7C3AED20', borderColor: '#A855F7' }]}>
                            <Text style={[styles.badgeText, { color: '#A855F7' }]}>Recomendado</Text>
                        </View>
                    </View>
                    <Text style={styles.price}>R$ 47,90/mês</Text>
                    <Text style={styles.priceSub}>Experiência completa</Text>

                    <View style={styles.featureRow}>
                        <FontAwesome name="check" size={13} color="#A855F7" />
                        <Text style={styles.featureText}>Tudo do plano Básico</Text>
                    </View>
                    <View style={styles.featureRow}>
                        <FontAwesome name="check" size={13} color="#A855F7" />
                        <Text style={styles.featureText}>Histórico completo de scans e diário</Text>
                    </View>
                    <View style={styles.featureRow}>
                        <FontAwesome name="check" size={13} color="#A855F7" />
                        <Text style={styles.featureText}>NutriCoach IA avançado</Text>
                    </View>
                    <View style={styles.featureRow}>
                        <FontAwesome name="check" size={13} color="#A855F7" />
                        <Text style={styles.featureText}>Planos ilimitados e personalizáveis</Text>
                    </View>

                    <TouchableOpacity style={styles.primaryBtn}>
                        <Text style={styles.primaryBtnText}>Assinar plano Full</Text>
                    </TouchableOpacity>

                    <Text style={styles.hintText}>
                        Pagamento seguro, renovação automática. Você pode cancelar em poucos toques.
                    </Text>
                </View>

                <Link href="/(tabs)/index" asChild>
                    <TouchableOpacity style={styles.secondaryBtn}>
                        <Text style={styles.secondaryBtnText}>Voltar ao dashboard</Text>
                    </TouchableOpacity>
                </Link>
            </ScrollView>
        </SafeAreaView>
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
    card: {
        backgroundColor: Colors.light.card,
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.light.border,
        marginBottom: 16,
    },
    cardHighlight: {
        borderColor: '#A855F7',
        backgroundColor: '#020617',
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#374151',
        backgroundColor: '#111827',
    },
    badgeText: {
        fontSize: 11,
        color: '#9CA3AF',
        fontWeight: '600',
    },
    price: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.light.text,
        marginTop: 8,
    },
    priceSub: {
        fontSize: 13,
        color: '#9CA3AF',
        marginBottom: 8,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    featureText: {
        fontSize: 13,
        color: '#D1D5DB',
    },
    primaryBtn: {
        marginTop: 14,
        backgroundColor: '#A855F7',
        paddingVertical: 12,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    hintText: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 8,
    },
    secondaryBtn: {
        marginTop: 8,
        alignSelf: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    secondaryBtnText: {
        color: '#9CA3AF',
        fontSize: 13,
        fontWeight: '500',
    },
});
