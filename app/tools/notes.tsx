import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

type Note = {
    id: string;
    text: string;
    createdAt: string;
};

const STORAGE_KEY = '@nutriscan_notes_v1';

export default function NotesScreen() {
    const [note, setNote] = useState('');
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);

    // Carrega as notas salvas ao abrir a tela
    useEffect(() => {
        const loadNotes = async () => {
            try {
                const stored = await AsyncStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const parsed: Note[] = JSON.parse(stored);
                    setNotes(parsed);
                }
            } catch (error) {
                console.warn('Erro ao carregar notas:', error);
            } finally {
                setLoading(false);
            }
        };

        loadNotes();
    }, []);

    // Sempre que as notas mudarem, salva no AsyncStorage
    useEffect(() => {
        const saveNotes = async () => {
            try {
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
            } catch (error) {
                console.warn('Erro ao salvar notas:', error);
            }
        };

        if (!loading) {
            saveNotes();
        }
    }, [notes, loading]);

    function addNote() {
        const trimmed = note.trim();
        if (!trimmed) return;

        const now = new Date();
        const createdAt = now.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });

        setNotes((prev) => [
            {
                id: String(Date.now()),
                text: trimmed,
                createdAt,
            },
            ...prev,
        ]);
        setNote('');
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Diário & Anotações</Text>
                <Text style={styles.subtitle}>
                    Registre como foi seu dia, sua disciplina, humor e insights sobre a dieta.
                </Text>
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    multiline
                    placeholder="Como foi seu dia hoje? Escreva aqui..."
                    placeholderTextColor="#6B7280"
                    value={note}
                    onChangeText={setNote}
                />
                <TouchableOpacity style={styles.addButton} onPress={addNote}>
                    <Text style={styles.addButtonText}>Salvar</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={notes}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <View style={styles.noteCard}>
                        <Text style={styles.noteDate}>{item.createdAt}</Text>
                        <Text style={styles.noteText}>{item.text}</Text>
                    </View>
                )}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyTitle}>Sem anotações ainda</Text>
                            <Text style={styles.emptyText}>
                                Comece registrando como você se sente em relação à dieta, treinos e rotina.
                            </Text>
                        </View>
                    ) : null
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF', // branco
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    inputContainer: {
        marginTop: 8,
        marginHorizontal: 16,
        backgroundColor: Colors.light.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.light.border,
        padding: 10,
    },
    input: {
        minHeight: 80,
        maxHeight: 140,
        color: '#FFFFFF',
        fontSize: 14,
        paddingHorizontal: 4,
        paddingVertical: 4,
    },
    addButton: {
        marginTop: 8,
        alignSelf: 'flex-end',
        backgroundColor: Colors.light.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 999,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 24,
    },
    noteCard: {
        backgroundColor: Colors.light.card,
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: Colors.light.border,
        marginBottom: 10,
    },
    noteDate: {
        fontSize: 11,
        color: '#9CA3AF',
        marginBottom: 4,
    },
    noteText: {
        fontSize: 14,
        color: '#E5E7EB',
    },
    emptyState: {
        paddingHorizontal: 16,
        paddingTop: 40,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 6,
    },
    emptyText: {
        fontSize: 13,
        color: '#9CA3AF',
        textAlign: 'center',
    },
});
