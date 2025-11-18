import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { deleteInvoice, getInvoices } from "../utils/storage";

export default function ListaFacturas() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");

  useFocusEffect(
    useCallback(() => {
      const loadInvoices = async () => {
        const list = await getInvoices();
        setInvoices(list || []);
        setFilteredInvoices(list || []);
      };
      loadInvoices();
    }, [])
  );

  // Filtrar faturas pelo nome do cliente
  React.useEffect(() => {
    const filtered = invoices.filter((i) =>
      i.cliente?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredInvoices(filtered);
  }, [searchText, invoices]);

  const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

  const handleDelete = (id: string) => {
    Alert.alert("Apagar fatura", "Deseja realmente apagar esta fatura?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Apagar",
        style: "destructive",
        onPress: async () => {
          await deleteInvoice(id);
          const list = await getInvoices();
          setInvoices(list);
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: any }) => {
    const scale = new Animated.Value(1);
    const onPressIn = () =>
      Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
    const onPressOut = () =>
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

    return (
      <AnimatedTouchable
        style={[styles.card, { transform: [{ scale }] }]}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() =>
            router.push({
              pathname: "facturaPreview",
              params: { invoiceId: item.id.toString() },
            })
          }
        >
          <View style={styles.cardHeader}>
            <Text style={styles.client}>{item.cliente}</Text>
            <Text style={styles.date}>
              {new Date(item.data).toLocaleDateString("pt-AO")}
            </Text>
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.total}>{item.total?.toFixed(2) || "0.00"} Kz</Text>
          </View>
        </TouchableOpacity>

        {/* Botão de apagar */}
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteText}>Apagar</Text>
        </TouchableOpacity>
      </AnimatedTouchable>
    );
  };

  return (
    <FlatList
      data={filteredInvoices}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
      ListHeaderComponent={
        <>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.header}>Lista de Faturas</Text>

          {/* Barra de pesquisa */}
          <TextInput
            placeholder="Pesquisar por cliente..."
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchInput}
            placeholderTextColor="#999"
          />

          {filteredInvoices.length === 0 && (
            <Text style={styles.emptyText}>Nenhuma fatura encontrada.</Text>
          )}
        </>
      }
      ListFooterComponent={<View style={{ height: 24 }} />}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f3f2f8", flexGrow: 1 },
  backButton: { marginBottom: 16, alignSelf: "flex-start" },
  backButtonText: { color: "#6B46C1", fontWeight: "600", fontSize: 16 },
  header: { fontSize: 26, fontWeight: "700", color: "#6B46C1", marginBottom: 12, textAlign: "center" },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  emptyText: { textAlign: "center", marginTop: 50, fontSize: 16, color: "#6B46C1", fontWeight: "600" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  client: { fontSize: 16, fontWeight: "700", color: "#333" },
  date: { fontSize: 14, color: "#555" },
  cardFooter: { alignItems: "flex-end" },
  total: { fontSize: 16, fontWeight: "700", color: "#6B46C1" },

  deleteButton: {
    marginLeft: 12,
    backgroundColor: "#F56565",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  deleteText: { color: "#fff", fontWeight: "600" },
});
