import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { db } from '../../lib/firebase';
import { useAuth } from '../../services/auth';

interface NotifPrefs {
    meals: boolean;
    water: boolean;
    weight: boolean;
    workout: boolean;
}

const DEFAULTS: NotifPrefs = { meals: true, water: false, weight: true, workout: true };

export default function NotificationsSettingsScreen() {
    const { user } = useAuth();
    const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULTS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        const ref = doc(db, 'users', user.uid, 'settings', 'notifications');
        getDoc(ref).then((snap) => {
            if (snap.exists()) {
                setPrefs({ ...DEFAULTS, ...(snap.data() as Partial<NotifPrefs>) });
            }
        }).finally(() => setLoading(false));
    }, [user]);

    const updatePref = async (key: keyof NotifPrefs, value: boolean) => {
        const next = { ...prefs, [key]: value };
        setPrefs(next);
        if (!user) return;
        const ref = doc(db, 'users', user.uid, 'settings', 'notifications');
        await setDoc(ref, next, { merge: true });
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <ActivityIndicator color={Colors.light.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Notificações</Text>
            <Text style={styles.subtitle}>
                Ajuste quais lembretes você quer receber do NutriScan.
            </Text>

            <SettingRow
                label="Refeições do dia"
                description="Lembretes para registrar café, almoço, jantar e lanches."
                value={prefs.meals}
                onValueChange={(v) => updatePref('meals', v)}
            />
            <SettingRow
                label="Água"
                description="Alertas suaves para beber água ao longo do dia."
                value={prefs.water}
                onValueChange={(v) => updatePref('water', v)}
            />
            <SettingRow
                label="Peso semanal"
                description="Lembrete para registrar peso 1x por semana."
                value={prefs.weight}
                onValueChange={(v) => updatePref('weight', v)}
            />
            <SettingRow
                label="Treino do dia"
                description="Notificações para iniciar ou concluir o treino planejado."
                value={prefs.workout}
                onValueChange={(v) => updatePref('workout', v)}
            />
        </SafeAreaView>
    );
}

function SettingRow({
    label,
    description,
    value,
    onValueChange,
}: {
    label: string;
    description: string;
    value: boolean;
    onValueChange: (v: boolean) => void;
}) {
    return (
        <View style={styles.row}>
            <View style={styles.rowText}>
                <Text style={styles.rowLabel}>{label}</Text>
                <Text style={styles.rowDescription}>{description}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                thumbColor={value ? Colors.light.primary : '#f4f3f4'}
                trackColor={{ false: '#4B5563', true: '#10B98155' }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
        padding: 16,
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
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
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#111827',
    },
    rowText: {
        flex: 1,
        paddingRight: 12,
    },
    rowLabel: {
        fontSize: 15,
        color: '#FFFFFF',
        marginBottom: 2,
    },
    rowDescription: {
        fontSize: 12,
        color: '#9CA3AF',
    },
});
