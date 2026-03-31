import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { auth } from '../../lib/firebase';
import { USE_FIREBASE_AUTH, useAuth } from '../../services/auth';


export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { signInAsGuest, mockSignIn } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Erro', 'Por favor preencha email e senha');
            return;
        }
        setLoading(true);
        try {
            if (USE_FIREBASE_AUTH) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                console.log('Dev Login: Skipping Firebase');
                mockSignIn(email);
            }
        } catch (error: any) {
            Alert.alert('Login Falhou', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGuestLogin = () => {
        if (!USE_FIREBASE_AUTH) {
            signInAsGuest();
        } else {
            Alert.alert('Guest Login', 'Not enabled in production yet');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.brandTitle}>NutriScan AI</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Bem-vindo de volta</Text>
                    <Text style={styles.cardSubtitle}>Entre para continuar sua jornada</Text>

                    <View style={styles.inputContainer}>
                        <FontAwesome name="envelope" size={20} color="#999" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <FontAwesome name="lock" size={20} color="#999" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Senha"
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
                    </TouchableOpacity>

                    <Link href="/(auth)/signup" asChild>
                        <TouchableOpacity style={styles.outlineButton}>
                            <Text style={styles.outlineButtonText}>Criar conta</Text>
                        </TouchableOpacity>
                    </Link>

                    {!USE_FIREBASE_AUTH && (
                        <TouchableOpacity style={styles.ghostButton} onPress={handleGuestLogin}>
                            <Text style={styles.ghostButtonText}>Entrar como convidado (Dev)</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <Text style={styles.footerText}>Experimente 30 dias grátis no plano Premium</Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    brandTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.light.primary,
        letterSpacing: 1,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 5,
        marginBottom: 30,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.light.text,
        marginBottom: 5,
        textAlign: 'center',
    },
    cardSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#E1E4E8',
        paddingHorizontal: 15,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 15,
        fontSize: 16,
        color: Colors.light.text,
    },
    button: {
        backgroundColor: Colors.light.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 15,
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    outlineButton: {
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.light.primary,
        marginBottom: 10,
    },
    outlineButtonText: {
        color: Colors.light.primary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    ghostButton: {
        paddingVertical: 15,
        alignItems: 'center',
    },
    ghostButtonText: {
        color: '#666',
        fontSize: 14,
    },
    footerText: {
        textAlign: 'center',
        color: '#999',
        fontSize: 14,
    },
});
