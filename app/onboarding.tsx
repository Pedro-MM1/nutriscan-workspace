import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');

const slides = [
    {
        title: 'Escaneie seus alimentos',
        description:
            'Use a câmera para estimar calorias e macros de pratos e ingredientes em segundos.',
        icon: 'camera',
    },
    {
        title: 'Monitore dieta e treinos',
        description:
            'Veja calorias diárias, macros e crie planos de dieta e treino personalizados.',
        icon: 'bar-chart',
    },
    {
        title: 'Evolua com IA',
        description:
            'Converse com o NutriCoach IA e receba orientações sobre hábitos e estratégias.',
        icon: 'magic',
    },
];

export default function OnboardingScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ alignItems: 'stretch' }}
            >
                {slides.map((slide, index) => (
                    <View key={slide.title} style={[styles.slide, { width }]}>
                        <View style={styles.iconWrapper}>
                            <FontAwesome name={slide.icon as any} size={40} color={Colors.light.primary} />
                        </View>
                        <Text style={styles.title}>{slide.title}</Text>
                        <Text style={styles.description}>{slide.description}</Text>

                        {index === slides.length - 1 && (
                            <Link href="/(auth)/login" asChild>
                                <TouchableOpacity style={styles.primaryBtn}>
                                    <Text style={styles.primaryBtnText}>Começar agora</Text>
                                </TouchableOpacity>
                            </Link>
                        )}

                        {index < slides.length - 1 && (
                            <Text style={styles.hintText}>
                                Deslize para o lado para continuar →
                            </Text>
                        )}
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    slide: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 1,
        borderColor: Colors.light.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        marginBottom: 24,
    },
    primaryBtn: {
        backgroundColor: Colors.light.primary,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 999,
        marginTop: 8,
    },
    primaryBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    hintText: {
        marginTop: 12,
        fontSize: 13,
        color: '#9CA3AF',
    },
});
