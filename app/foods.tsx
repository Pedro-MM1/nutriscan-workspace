import React, { useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type FoodItem = {
    id: string;
    name: string;
    calories: number; // por 100g
    protein: number;
    carbs: number;
    fats: number;
};

const MOCK_FOODS: FoodItem[] = [
    { id: '1', name: 'Arroz branco cozido', calories: 130, protein: 2.5, carbs: 28, fats: 0.2 },
    { id: '2', name: 'Peito de frango grelhado', calories: 165, protein: 31, carbs: 0, fats: 3.6 },
    { id: '3', name: 'Ovo cozido', calories: 155, protein: 13, carbs: 1.1, fats: 11 },
    { id: '4', name: 'Banana prata', calories: 89, protein: 1.1, carbs: 23, fats: 0.3 },
    { id: '5', name: 'Aveia em flocos', calories: 389, protein: 17, carbs: 66, fats: 7 },
];

export default function FoodsScreen() {
    const [query, setQuery] = useState('');

    const filtered = MOCK_FOODS.filter((food) =>
        food.name.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Banco de alimentos</Text>
            <Text style={styles.text}>
                Aqui você poderá buscar alimentos, ver calorias e macros. Depois podemos
                conectar em uma API própria ou Firestore.
            </Text>

            <TextInput
                style={styles.input}
                placeholder="Buscar alimento (ex: arroz, banana, frango)..."
                placeholderTextColor="#9CA3AF"
                value={query}
                onChangeText={setQuery}
            />

            <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.foodCard}
                        onPress={() => {
                            alert(
                                `${item.name}\n\nCalorias (100g): ${item.calories} kcal\nProteínas: ${item.protein} g\nCarboidratos: ${item.carbs} g\nGorduras: ${item.fats} g`
                            );
                        }}
                    >
                        <Text style={styles.foodName}>{item.name}</Text>
                        <Text style={styles.foodKcal}>{item.calories} kcal / 100g</Text>
                        <Text style={styles.foodMacros}>
                            P: {item.protein}g • C: {item.carbs}g • G: {item.fats}g
                        </Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 40 },
    title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
    text: { fontSize: 14, color: '#4B5563', marginBottom: 12 },
    input: {
        backgroundColor: '#020617',
        borderRadius: 999,
        paddingHorizontal: 16,
        paddingVertical: 10,
        color: '#F9FAFB',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#111827',
    },
    foodCard: {
        backgroundColor: '#020617',
        padding: 14,
        borderRadius: 14,
        marginBottom: 10,
    },
    foodName: {
        color: '#F9FAFB',
        fontSize: 15,
        fontWeight: '600',
    },
    foodKcal: {
        color: '#9CA3AF',
        fontSize: 12,
        marginTop: 4,
    },
    foodMacros: {
        color: '#6EE7B7',
        fontSize: 12,
        marginTop: 4,
    },
});
