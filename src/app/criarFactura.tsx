import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { formatCurrency, uid } from "../utils/format";
import { getClients, getProducts, saveInvoice } from "../utils/storage";

export default function CriarFactura() {
  const router = useRouter();

  const [cliente, setCliente] = useState("");
  const [produtos, setProdutos] = useState<
    { nome: string; descricao?: string; quantidade: number; preco: number }[]
  >([{ nome: "", descricao: "", quantidade: 1, preco: 0 }]);
  const [imposto, setImposto] = useState<number>(14);
  const [desconto, setDesconto] = useState<number>(0);
  const [logoUri, setLogoUri] = useState<string | null>(null);

  // Modais
  const [modalClienteVisible, setModalClienteVisible] = useState(false);
  const [modalProdutoVisible, setModalProdutoVisible] = useState(false);

  // Clientes
  const [clientes, setClientes] = useState<any[]>([]);
  const [clientesFiltrados, setClientesFiltrados] = useState<any[]>([]);
  const [searchCliente, setSearchCliente] = useState("");

  // Produtos
  const [produtosCadastrados, setProdutosCadastrados] = useState<any[]>([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState<any[]>([]);
  const [searchProduto, setSearchProduto] = useState("");
  const [produtoSelecionadoIndex, setProdutoSelecionadoIndex] = useState<number>(0);

  useEffect(() => {
    // Filtrar clientes
    if (searchCliente.trim() === "") {
      setClientesFiltrados(clientes);
    } else {
      setClientesFiltrados(
        clientes.filter((c) =>
          c.nome?.toLowerCase().includes(searchCliente.toLowerCase())
        )
      );
    }
  }, [searchCliente, clientes]);

  useEffect(() => {
    // Filtrar produtos
    if (searchProduto.trim() === "") {
      setProdutosFiltrados(produtosCadastrados);
    } else {
      setProdutosFiltrados(
        produtosCadastrados.filter((p) =>
          p.nome?.toLowerCase().includes(searchProduto.toLowerCase())
        )
      );
    }
  }, [searchProduto, produtosCadastrados]);

  const subtotal = produtos.reduce(
    (s, p) => s + (p.preco || 0) * (p.quantidade || 0),
    0
  );
  const impostoValor = (imposto / 100) * subtotal;
  const descontoValor = (desconto / 100) * subtotal;
  const total = subtotal + impostoValor - descontoValor;

  // Produtos
  const addProduto = () =>
    setProdutos([...produtos, { nome: "", descricao: "", quantidade: 1, preco: 0 }]);
  const removeProduto = (index: number) =>
    setProdutos(produtos.filter((_, i) => i !== index));
  const updateProduto = (index: number, field: string, value: any) => {
    const arr = [...produtos];
    arr[index] = { ...arr[index], [field]: value };
    setProdutos(arr);
  };

  // Abrir modal de clientes
  const abrirModalClientes = async () => {
    const list = await getClients();
    setClientes(list);
    setClientesFiltrados(list);
    setSearchCliente("");
    setModalClienteVisible(true);
  };

  // Abrir modal de produtos
  const abrirModalProdutos = async (index: number) => {
    const list = await getProducts();
    setProdutosCadastrados(list);
    setProdutosFiltrados(list);
    setProdutoSelecionadoIndex(index);
    setSearchProduto("");
    setModalProdutoVisible(true);
  };

  // Selecionar cliente
  const selecionarCliente = (clienteSelecionado: any) => {
    setCliente(String(clienteSelecionado.nome || ""));
    setModalClienteVisible(false);
  };

  // Selecionar produto
  const selecionarProduto = (produtoSelecionado: any) => {
    const arr = [...produtos];
    arr[produtoSelecionadoIndex] = {
      nome: String(produtoSelecionado.nome || ""),
      descricao: String(produtoSelecionado.descricao || ""),
      quantidade: 1,
      preco: Number(produtoSelecionado.preco || 0),
    };
    setProdutos(arr);
    setModalProdutoVisible(false);
  };

  // Gerar fatura
  const gerar = async () => {
    if (!cliente.trim()) {
      Alert.alert("Preencha o nome do cliente");
      return;
    }

    for (let p of produtos) {
      if (!p.nome.trim() || p.quantidade <= 0 || p.preco < 0) {
        Alert.alert("Preencha corretamente todos os produtos");
        return;
      }
    }

    const invoice = {
      id: uid(),
      cliente,
      artigos: produtos,
      imposto,
      desconto,
      subtotal,
      total,
      data: new Date().toISOString(),
      logoUri,
    };

    try {
      await saveInvoice(invoice);

      setCliente("");
      setProdutos([{ nome: "", descricao: "", quantidade: 1, preco: 0 }]);
      setImposto(14);
      setDesconto(0);
      setLogoUri(null);

      router.push({
        pathname: "facturaPreview",
        params: { invoiceId: invoice.id },
      });
    } catch (error) {
      Alert.alert("Erro ao salvar a fatura", String(error));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Nova Factura</Text>

      {/* Campo Cliente */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={cliente}
          onChangeText={setCliente}
          placeholder="Nome do cliente"
        />
        <TouchableOpacity style={styles.searchButton} onPress={abrirModalClientes}>
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Produtos */}
      <View style={styles.sectionHeader}>
        <Text style={styles.label}>Produtos</Text>
        <TouchableOpacity style={styles.addButton} onPress={addProduto}>
          <Text style={styles.addButtonText}>+ Adicionar</Text>
        </TouchableOpacity>
      </View>

      {produtos.map((p, i) => (
        <View key={i} style={styles.prodCard}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TextInput
              placeholder="Nome do produto"
              value={p.nome}
              style={[styles.prodInput, { flex: 1 }]}
              onChangeText={(t) => updateProduto(i, "nome", t)}
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => abrirModalProdutos(i)}
            >
              <Text style={styles.searchButtonText}>🔍</Text>
            </TouchableOpacity>
          </View>

          {p.descricao ? <Text style={styles.descricao}>{p.descricao}</Text> : null}

          <View style={styles.row}>
            <TextInput
              placeholder="Qtd"
              value={String(p.quantidade)}
              keyboardType="numeric"
              style={[styles.prodInput, { flex: 1 }]}
              onChangeText={(t) => updateProduto(i, "quantidade", Number(t || 1))}
            />
            <TextInput
              placeholder="Preço"
              value={String(p.preco)}
              keyboardType="numeric"
              style={[styles.prodInput, { flex: 1, marginLeft: 8 }]}
              onChangeText={(t) => updateProduto(i, "preco", Number(t || 0))}
            />
            <TouchableOpacity
              style={[styles.removeButton, { marginLeft: 8 }]}
              onPress={() => removeProduto(i)}
            >
              <Text style={styles.removeButtonText}>Remover</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Impostos e desconto */}
      <View style={styles.section}>
        <Text style={styles.label}>Imposto %</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={String(imposto)}
          onChangeText={(t) => setImposto(Number(t || 0))}
        />
        <Text style={styles.label}>Desconto %</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={String(desconto)}
          onChangeText={(t) => setDesconto(Number(t || 0))}
        />
      </View>

      {/* Totais */}
      <View style={styles.totalCard}>
        <Text style={styles.totalText}>Subtotal: {formatCurrency(subtotal)}</Text>
        <Text style={styles.totalText}>Imposto: {formatCurrency(impostoValor)}</Text>
        <Text style={styles.totalText}>Desconto: {formatCurrency(descontoValor)}</Text>
        <Text style={[styles.totalText, { fontWeight: "700", fontSize: 18 }]}>
          Total: {formatCurrency(total)}
        </Text>
      </View>

      <TouchableOpacity style={styles.generateButton} onPress={gerar}>
        <Text style={styles.generateButtonText}>Gerar Factura</Text>
      </TouchableOpacity>

      {/* Modal Clientes */}
      <Modal
        visible={modalClienteVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione um Cliente</Text>

            <TextInput
              placeholder="Buscar cliente..."
              value={searchCliente}
              onChangeText={setSearchCliente}
              style={styles.modalInput}
            />

            <FlatList
              data={clientesFiltrados}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => selecionarCliente(item)}
                >
                  <Text>{item.nome}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text>Nenhum cliente encontrado</Text>}
            />

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalClienteVisible(false)}
            >
              <Text style={styles.modalCloseText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Produtos */}
      <Modal
        visible={modalProdutoVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione um Produto</Text>

            <TextInput
              placeholder="Buscar produto..."
              value={searchProduto}
              onChangeText={setSearchProduto}
              style={styles.modalInput}
            />

            <FlatList
              data={produtosFiltrados}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => selecionarProduto(item)}
                >
                  <Text>{item.nome}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text>Nenhum produto encontrado</Text>}
            />

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalProdutoVisible(false)}
            >
              <Text style={styles.modalCloseText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#f9f9f9" },
  backButton: { marginBottom: 12 },
  backButtonText: { color: "#8A2BE2", fontWeight: "600", fontSize: 16 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16, color: "#333" },
  label: { fontWeight: "600", marginBottom: 6, color: "#555" },
  input: { borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 8, backgroundColor: "#fff", marginBottom: 12 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  addButton: { backgroundColor: "#8A2BE2", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  addButtonText: { color: "#fff", fontWeight: "600" },
  prodCard: { backgroundColor: "#fff", padding: 12, borderRadius: 8, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  prodInput: { borderWidth: 1, borderColor: "#ddd", padding: 8, borderRadius: 6, backgroundColor: "#fefefe", marginBottom: 8 },
  descricao: { fontSize: 12, color: "#777", marginBottom: 6 },
  row: { flexDirection: "row", alignItems: "center" },
  removeButton: { backgroundColor: "#FF6B6B", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  removeButtonText: { color: "#fff", fontWeight: "600" },
  section: { marginBottom: 16 },
  totalCard: { backgroundColor: "#fff", padding: 16, borderRadius: 8, marginVertical: 16, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  totalText: { fontSize: 16, marginBottom: 6, color: "#333" },
  generateButton: { backgroundColor: "#8A2BE2", paddingVertical: 14, borderRadius: 8, alignItems: "center", marginBottom: 24 },
  generateButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  searchButton: { marginLeft: 8, padding: 8, backgroundColor: "#6B46C1", borderRadius: 6 },
  searchButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { width: "90%", maxHeight: "80%", backgroundColor: "#fff", padding: 16, borderRadius: 12 },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  modalInput: { borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 8, backgroundColor: "#fff", marginBottom: 12 },
  modalItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  modalCloseButton: { backgroundColor: "#E53E3E", padding: 12, borderRadius: 8, marginTop: 10, alignItems: "center" },
  modalCloseText: { color: "#fff", fontWeight: "700" },
});
