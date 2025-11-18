import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from "react-native";
import { getClients, saveClient } from "../utils/storage";

export default function CadastrarCliente({ route }: any) {
  const router = useRouter();
  const clienteId = router?.params?.clienteId || undefined;

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [morada, setMorada] = useState("");

  // Carrega dados do cliente para edição
  useEffect(() => {
    if (clienteId) {
      (async () => {
        const clients = await getClients();
        const cliente = clients.find((c: any) => c.id === clienteId);
        if (cliente) {
          setNome(cliente.nome || "");
          setTelefone(cliente.telefone || "");
          setMorada(cliente.morada || "");
        }
      })();
    }
  }, [clienteId]);

  const handleSave = async () => {
    if (!nome.trim() || !telefone.trim() || !morada.trim()) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios.");
      return;
    }

    const novoCliente = {
      id: clienteId || Date.now().toString(),
      nome,
      telefone,
      morada,
    };

    await saveClient(novoCliente);
    Alert.alert(
      "Sucesso",
      `Cliente ${clienteId ? "atualizado" : "cadastrado"} com sucesso!`
    );

    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Botão de voltar customizado */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.header}>
        {clienteId ? "Editar Cliente" : "Cadastrar Cliente"}
      </Text>

      <Text style={styles.label}>Nome</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Nome do cliente"
        placeholderTextColor="#9F7AEA"
      />

      <Text style={styles.label}>Telefone</Text>
      <TextInput
        style={styles.input}
        value={telefone}
        onChangeText={setTelefone}
        placeholder="Telefone do cliente"
        keyboardType="phone-pad"
        placeholderTextColor="#9F7AEA"
      />

      <Text style={styles.label}>Morada</Text>
      <TextInput
        style={styles.input}
        value={morada}
        onChangeText={setMorada}
        placeholder="Morada do cliente"
        placeholderTextColor="#9F7AEA"
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>
          {clienteId ? "Atualizar Cliente" : "Salvar Cliente"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "#F3F0FF",
  },

  backButton: {
    marginBottom: 20,
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
    marginBottom: 24,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#553C9A",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#D6BCFA",
  },

  saveButton: {
    marginTop: 24,
    backgroundColor: "#6B46C1",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
