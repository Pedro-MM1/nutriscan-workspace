import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { api, ConversationTurn } from '../../services/api';

type Message = {
    id: string;
    text: string;
    sender: 'user' | 'ai';
};

export default function AiCoachScreen() {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: 'Olá! Sou seu coach de nutrição e fitness. Como posso te ajudar hoje?', sender: 'ai' }
    ]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        const text = inputText.trim();
        setInputText('');

        const userMsg: Message = {
            id: Date.now().toString(),
            text,
            sender: 'user',
        };

        // Captura o histórico antes de adicionar a nova mensagem.
        // A mensagem inicial do AI (sender: 'ai') vira role 'model' para o Gemini.
        const history: ConversationTurn[] = messages.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text,
        }));

        setMessages(prev => [...prev, userMsg]);
        setLoading(true);

        try {
            const response = await api.coachAI(text, history);

            // ✅ garante tipagem segura
            const aiText =
                typeof response === 'object' &&
                    response !== null &&
                    'text' in response
                    ? String((response as { text: string }).text)
                    : 'Não consegui entender sua pergunta.';

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: aiText,
                sender: 'ai',
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: 'Desculpe, tive um problema. Tente novamente.',
                sender: 'ai',
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }, [messages]);

    const renderItem = ({ item }: { item: Message }) => {
        const isUser = item.sender === 'user';
        return (
            <View style={[
                styles.messageBubble,
                isUser ? styles.userBubble : styles.aiBubble
            ]}>
                {!isUser && (
                    <View style={styles.aiAvatar}>
                        <FontAwesome name="magic" size={12} color="#fff" />
                    </View>
                )}
                <Text style={[
                    styles.messageText,
                    isUser ? styles.userText : styles.aiText
                ]}>{item.text}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>NutriScan Coach</Text>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Pergunte sobre sua dieta..."
                        placeholderTextColor="#999"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                        onPress={sendMessage}
                        disabled={loading || !inputText.trim()}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <FontAwesome name="arrow-up" size={16} color="#fff" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        backgroundColor: '#fff',
        paddingVertical: 15,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E1E4E8',
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.light.text,
    },
    listContent: {
        padding: 20,
        paddingBottom: 20,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 20,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    userBubble: {
        backgroundColor: Colors.light.primary,
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        backgroundColor: '#fff',
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    aiAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.light.accent,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
        marginTop: -2,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    userText: {
        color: '#fff',
    },
    aiText: {
        color: '#333',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E1E4E8',
        alignItems: 'flex-end',
    },
    input: {
        flex: 1,
        backgroundColor: '#F5F7FA',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        maxHeight: 100,
        fontSize: 15,
        color: '#333',
        marginRight: 10,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.light.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#ccc',
    },
});
