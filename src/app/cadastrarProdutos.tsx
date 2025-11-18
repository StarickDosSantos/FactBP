import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { uid } from "../utils/format"; // ✅ CORRIGIDO
import { getProducts, saveProduct } from "../utils/storage";

export default function CadastrarProduto() {
  const router = useRouter();
  const { produtoId } = useLocalSearchParams<{ produtoId: string }>();

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");

  useEffect(() => {
    if (produtoId) {
      carregarProduto(produtoId);
    }
  }, [produtoId]);

  const carregarProduto = async (id: string) => {
    const produtos = await getProducts();
    const produto = produtos.find((p) => p.id === id);
    if (produto) {
      setTitulo(produto.nome);
      setDescricao(produto.descricao);
      setPreco(produto.preco.toString());
    }
  };

  const handleSalvar = async () => {
    if (!titulo.trim()) {
      Alert.alert("Erro", "O título é obrigatório!");
      return;
    }
    if (!preco.trim()) {
      Alert.alert("Erro", "O preço é obrigatório!");
      return;
    }

    const precoNumero = parseFloat(preco.replace(",", "."));
    if (isNaN(precoNumero) || precoNumero < 0) {
      Alert.alert("Erro", "Digite um preço válido!");
      return;
    }

    const produtoData = {
      id: produtoId || uid(), // ✅ CORRIGIDO
      nome: titulo,
      descricao,
      preco: precoNumero,
    };

    await saveProduct(produtoData);

    Alert.alert(
      "Sucesso",
      `Produto ${produtoId ? "atualizado" : "cadastrado"} com sucesso!`,
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F3F0FF" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
          <View style={styles.container}>
            <Text style={styles.header}>
              {produtoId ? "Editar Produto" : "Cadastrar Produto"}
            </Text>

            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do produto"
              value={titulo}
              onChangeText={setTitulo}
              placeholderTextColor="#A78BFA"
            />

            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Descrição do produto"
              value={descricao}
              onChangeText={setDescricao}
              multiline
              placeholderTextColor="#A78BFA"
            />

            <Text style={styles.label}>Preço *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={preco}
              onChangeText={(text) => {
                const regex = /^[0-9]*[.,]?[0-9]*$/;
                if (regex.test(text)) setPreco(text);
              }}
              keyboardType="numeric"
              placeholderTextColor="#A78BFA"
            />
          </View>
      </ScrollView>

      <TouchableOpacity style={styles.floatingButton} onPress={handleSalvar}>
        <Text style={styles.floatingButtonText}>
          {produtoId ? "Atualizar Produto" : "Cadastrar Produto"}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#6B46C1",
    marginBottom: 24,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A148C",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D6BCFA",
    fontSize: 16,
    color: "#4B0082",
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#6B46C1",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 7,
  },
  floatingButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
