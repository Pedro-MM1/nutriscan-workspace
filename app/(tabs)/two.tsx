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
import { Colors } from '../../constants/Colors';

type ToolCardProps = {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  title: string;
  description: string;
  route: string;
};

function ToolCard({ icon, title, description, route }: ToolCardProps) {
  return (
    <Link href={route} asChild>
      <TouchableOpacity style={styles.toolCard}>
        <View style={styles.toolIconWrapper}>
          <FontAwesome name={icon} size={20} color={Colors.light.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.toolTitle}>{title}</Text>
          <Text style={styles.toolDescription}>{description}</Text>
        </View>
        <FontAwesome name="chevron-right" size={14} color="#6B7280" />
      </TouchableOpacity>
    </Link>
  );
}

export default function ToolsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Ferramentas NutriScan</Text>
        <Text style={styles.subtitle}>
          Use as ferramentas abaixo para montar sua rotina completa de alimentação e treinos.
        </Text>

        <ToolCard
          icon="apple"
          title="Gerador de Dieta"
          description="Monte planos alimentares de forma rápida com base na sua meta."
          route="/tools/diet-generator"
        />

        <ToolCard
          icon="heartbeat"
          title="Gerador de Treino"
          description="Crie treinos personalizados para casa ou academia."
          route="/tools/workout-generator"
        />

        <ToolCard
          icon="sticky-note"
          title="Diário & Anotações"
          description="Registre como foi seu dia, humor, energia e disciplina."
          route="/tools/notes"
        />

        <ToolCard
          icon="camera"
          title="Scanner de Alimentos"
          description="Escaneie pratos e alimentos para estimar calorias e macros."
          route="/(tabs)/scanner"
        />

        <ToolCard
          icon="star"
          title="Assinatura Premium"
          description="Desbloqueie IA avançada, planos ilimitados e histórico completo."
          route="/subscription"
        />
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
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 10,
  },
  toolIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  toolDescription: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
});
