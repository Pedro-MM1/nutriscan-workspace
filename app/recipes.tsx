import React, { useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type Recipe = {
    id: string;
    title: string;
    source: string;
    caloriesPerPortion: number;
};

const MOCK_RECIPES: Recipe[] = [
    {
        id: '1',
        title: 'Frango grelhado com legumes',
        source: 'Receita criada no app',
        caloriesPerPortion: 420,
    },
    {
        id: '2',
        title: 'Overnight oats de banana',
        source: 'Importado de site',
        caloriesPerPortion: 280,
    },
];

export default function RecipesScreen() {
    const [url, setUrl] = useState('');
    const [recipes, setRecipes] = useState<Recipe[]>(MOCK_RECIPES);

    const handleImport = () => {
        if (!url.trim()) {
            alert('Cole a URL da receita primeiro 😉');
            return;
        }

        // Futuro: chamar backend/Cloud Function
        const fakeRecipe: Recipe = {
            id: Date.now().toString(),
            title: 'Receita importada via URL',
            source: url,
            caloriesPerPortion: 350,
        };

        setRecipes((prev) => [fakeRecipe, ...prev]);
        setUrl('');
        alert(
            'Simulação de importação concluída! No futuro, aqui vamos extrair ingredientes, porções e calcular calorias com IA.'
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Receitas inteligentes</Text>
            <Text style={styles.text}>
                Cole a URL de uma receita (ex: TudoGostoso, Panelinha) e o NutriScan AI
                poderá importar ingredientes, porções e estimar calorias por porção.
            </Text>

            <TextInput
                style={styles.input}
                placeholder="Cole aqui a URL da receita..."
                placeholderTextColor="#9CA3AF"
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                autoCorrect={false}
            />

            <TouchableOpacity style={styles.button} onPress={handleImport}>
                <Text style={styles.buttonText}>🍽 Importar da URL</Text>
            </TouchableOpacity>

            <Text style={[styles.subtitle, { marginTop: 18 }]}>Minhas receitas</Text>

            <FlatList
                data={recipes}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.recipeCard}
                        onPress={() =>
                            alert(
                                `${item.title}\n\nOrigem: ${item.source}\nCalorias/porção (simulado): ${item.caloriesPerPortion} kcal`
                            )
                        }
                    >
                        <Text style={styles.recipeTitle}>{item.title}</Text>
                        <Text style={styles.recipeSource}>{item.source}</Text>
                        <Text style={styles.recipeKcal}>
                            {item.caloriesPerPortion} kcal / porção
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
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        color: '#F9FAFB',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#111827',
    },
    button: {
        backgroundColor: '#22C55E',
        paddingVertical: 12,
        borderRadius: 999,
        alignItems: 'center',
    },
    buttonText: {
        color: '#022C22',
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    recipeCard: {
        backgroundColor: '#020617',
        padding: 14,
        borderRadius: 14,
        marginBottom: 10,
    },
    recipeTitle: {
        color: '#F9FAFB',
        fontSize: 15,
        fontWeight: '600',
    },
    recipeSource: {
        color: '#9CA3AF',
        fontSize: 11,
        marginTop: 2,
    },
    recipeKcal: {
        color: '#6EE7B7',
        fontSize: 12,
        marginTop: 6,
    },
});
