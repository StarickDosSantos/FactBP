import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { deleteProduct, getProducts } from "../utils/storage"; // Adicione deleteProduct no seu storage

export default function ListaProdutos() {
  const router = useRouter();
  const [produtos, setProdutos] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  // Carregar produtos do storage
  useEffect(() => {
    const loadProducts = async () => {
      const list = await getProducts();
      setProdutos(list || []);
    };
    loadProducts();
  }, []);

  // Função para remover produto
  const removerProduto = (id: string) => {
    Alert.alert(
      "Remover Produto",
      "Tem certeza que deseja remover este produto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            await deleteProduct(id); // Remove do storage
            setProdutos(produtos.filter((p) => p.id !== id)); // Atualiza lista local
          },
        },
      ]
    );
  };

  // Filtrar produtos pela busca
  const produtosFiltrados = produtos.filter((p) =>
    p.nome?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Button title="← Voltar" onPress={() => router.back()} color="#6B46C1" />

      <Text style={styles.header}>Produtos</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Pesquisar produto..."
        value={search}
        onChangeText={setSearch}
        placeholderTextColor="#9F7AEA"
      />

      <FlatList
        data={produtosFiltrados}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.prodCard}>
            <TouchableOpacity
              onPress={() =>
                router.push(`/cadastrarProduto?produtoId=${item.id}`)
              }
            >
              <Text style={styles.prodNome}>{item.nome}</Text>
              <Text style={styles.prodPreco}>Preço: {item.preco} Kz</Text>
              {item.descricao && (
                <Text style={styles.prodDesc}>{item.descricao}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => removerProduto(item.id)}
            >
              <Text style={styles.deleteButtonText}>Remover</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum produto encontrado.</Text>
        }
        contentContainerStyle={{ paddingBottom: 140 }}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/cadastrarProdutos")}
      >
        <Text style={styles.addButtonText}>+ Adicionar Produto</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F3F0FF",
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#6B46C1",
    marginBottom: 16,
    textAlign: "center",
  },
  searchInput: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#D6BCFA",
    marginBottom: 16,
  },
  prodCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E9D8FD",
  },
  prodNome: {
    fontSize: 18,
    fontWeight: "700",
    color: "#553C9A",
  },
  prodPreco: {
    fontSize: 16,
    marginTop: 4,
    color: "#6B46C1",
  },
  prodDesc: {
    fontSize: 14,
    marginTop: 4,
    color: "#555",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 24,
    color: "#555",
    fontStyle: "italic",
  },
  addButton: {
    backgroundColor: "#6B46C1",
    paddingVertical: 14,
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
  deleteButton: {
    marginTop: 8,
    backgroundColor: "#FF6B6B",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
