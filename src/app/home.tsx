import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function Home() {
  const router = useRouter();

  const cards: {
    title: string;
    route: string;
    icon: JSX.Element;
  }[] = [
    {
      title: "Criar Factura",
      icon: <MaterialIcons name="receipt-long" size={32} color="#fff" />,
      route: "/criarFactura",
    },
    {
      title: "Lista de Facturas",
      icon: (
        <MaterialIcons name="format-list-bulleted" size={32} color="#fff" />
      ),
      route: "/listaFacturas",
    },
    {
      title: "Cliente",
      icon: <FontAwesome5 name="user-plus" size={32} color="#fff" />,
      route: "/clientes",
    },
    {
      title: "Produtos",
      icon: <MaterialIcons name="inventory" size={32} color="#fff" />,
      route: "/produtos",
    },
  ];

  const navigate = (route: string) => {
    if (!route) return;
    router.push(route);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Painel de Gestão</Text>

      <View style={styles.grid}>
        {cards.map((card, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => navigate(card.route)}
            activeOpacity={0.85}
          >
            <View style={styles.iconContainer}>{card.icon}</View>
            <Text style={styles.cardTitle}>{card.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "#F3F0FF",
    alignItems: "center",
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#6B46C1",
    marginBottom: 30,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  card: {
    backgroundColor: "#805AD5",
    width: "48%",
    aspectRatio: 1,
    borderRadius: 16,
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 12,
  },
  cardTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});
