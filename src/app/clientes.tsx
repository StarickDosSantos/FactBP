import { Link, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { deleteClient, getClients } from "../utils/storage";

export default function Clientes() {
  const router = useRouter();
  const [clientes, setClientes] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  // 🔄 Recarregar clientes quando a tela volta ao foco
  useFocusEffect(
    useCallback(() => {
      const loadClients = async () => {
        const list = await getClients();
        setClientes(list || []);
      };
      loadClients();
    }, [])
  );

  // 🔍 Filtrar clientes pela pesquisa
  const filteredClients = clientes.filter((c) =>
    c.nome?.toLowerCase().includes(search.toLowerCase())
  );

  // ❌ Excluir cliente
  const handleDelete = (id: string) => {
    Alert.alert(
      "Excluir Cliente",
      "Tem certeza que deseja excluir este cliente?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            await deleteClient(id);
            const updatedList = await getClients();
            setClientes(updatedList);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* ← Botão de Voltar */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Clientes</Text>

      {/* 🔍 Barra de pesquisa */}
      <TextInput
        style={styles.searchInput}
        placeholder="Pesquisar cliente..."
        value={search}
        onChangeText={setSearch}
        placeholderTextColor="#9F7AEA"
      />

      {/* 📋 Lista de clientes */}
      <FlatList
        data={filteredClients}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.clientCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.clientName}>{item.nome}</Text>
              <Text style={styles.clientInfo}>{item.telefone}</Text>
              <Text style={styles.clientInfo}>{item.morada}</Text>
            </View>

            <View style={styles.cardButtons}>
              {/* ✏️ Editar */}
              <Link
                href={{
                  pathname: "/cadastrarCliente",
                  params: { clienteId: item.id },
                }}
                asChild
              >
                <TouchableOpacity style={styles.editButton}>
                  <Text style={styles.buttonText}>Editar</Text>
                </TouchableOpacity>
              </Link>

              {/* ❌ Excluir */}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.buttonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum cliente encontrado.</Text>
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      {/* ➕ Adicionar novo cliente */}
      <Link href="/cadastrarCliente" asChild>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Adicionar Cliente</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F0FF",
    padding: 16,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: "#6B46C1",
    fontSize: 18,
    fontWeight: "600",
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#6B46C1",
    marginVertical: 16,
    textAlign: "center",
  },
  searchInput: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D6BCFA",
    marginBottom: 16,
    fontSize: 16,
  },
  clientCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E9D8FD",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  clientName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
    color: "#553C9A",
  },
  clientInfo: {
    fontSize: 14,
    color: "#555",
  },
  cardButtons: {
    marginLeft: 12,
    justifyContent: "space-between",
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#6B46C1",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 6,
  },
  deleteButton: {
    backgroundColor: "#E53E3E",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
  addButton: {
    backgroundColor: "#6B46C1",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#777",
    fontStyle: "italic",
  },
});
