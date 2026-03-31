import React, { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

export default function NotificationsSettingsScreen() {
    const [meals, setMeals] = useState(true);
    const [water, setWater] = useState(false);
    const [weight, setWeight] = useState(true);
    const [workout, setWorkout] = useState(true);

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Notificações</Text>
            <Text style={styles.subtitle}>
                Ajuste quais lembretes você quer receber do NutriScan.
            </Text>

            <SettingRow
                label="Refeições do dia"
                description="Lembretes para registrar café, almoço, jantar e lanches."
                value={meals}
                onValueChange={setMeals}
            />
            <SettingRow
                label="Água"
                description="Alertas suaves para beber água ao longo do dia."
                value={water}
                onValueChange={setWater}
            />
            <SettingRow
                label="Peso semanal"
                description="Lembrete para registrar peso 1x por semana."
                value={weight}
                onValueChange={setWeight}
            />
            <SettingRow
                label="Treino do dia"
                description="Notificações para iniciar ou concluir o treino planejado."
                value={workout}
                onValueChange={setWorkout}
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
