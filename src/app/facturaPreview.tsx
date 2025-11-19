import * as ImagePicker from "expo-image-picker";
import * as Print from "expo-print";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { getFacturas } from "../utils/storage";

export default function FacturaPreview() {
  const router = useRouter();
  const [invoice, setInvoice] = useState<any>(null);

  const [companyLogo, setCompanyLogo] = useState<string>(require("../../assets/images/BP_Logotipo.png"));
  const [companyName, setCompanyName] = useState<string>("Brilho no Ponto");
  const [companyAddress, setCompanyAddress] = useState<string>("Luanda, Angola");

  useEffect(() => {
    const loadInvoice = async () => {
      const list = await getFacturas();
      if (list.length === 0) {
        Alert.alert("Nenhuma fatura encontrada");
        return;
      }
      setInvoice(list[0]);
    };
    loadInvoice();
  }, []);

  const pickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setCompanyLogo(result.assets[0].uri);
    }
  };

  const exportPdf = async () => {
    if (!invoice) return;

    const formattedDate = new Date(invoice.data).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const subtotal =
      invoice.artigos?.reduce(
        (acc: number, item: any) => acc + item.preco * item.quantidade,
        0
      ) || 0;
    const impostoValor = invoice.impostoValor || 0;
    const total = invoice.total || subtotal + impostoValor;

    // HTML do PDF
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Invoice</title>
<style>
  html, body { margin:0; padding:0; width:100%; height:100%; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background:#f9f9f9; color:#333; }
  .invoice { display:flex; flex-direction:column; min-height:1122px; width:100%; background:#f9f9f9; border-top:6px solid #9c207b; padding-bottom:20px; }
  header { padding:40px 40px 20px; background:white; }
  .logo img { height:50px; }
  .invoice-title { font-size:48px; font-weight:900; color:#2a05bd; margin:10px 0; }
  .invoice-meta { display:flex; justify-content:space-between; font-family:monospace; font-size:13px; color:#2a05bd; }
  .invoice-meta .billing-info { text-align:right; }
  table { width:100%; border-collapse:separate; border-spacing:0; margin:30px 40px; font-size:14px; box-shadow:0 2px 5px rgba(0,0,0,0.1); border-radius:8px; overflow:hidden; }
  thead tr { background-image: linear-gradient(90deg, #ad1c76, #580454ff); color:white; font-weight:700; text-transform:uppercase; }
  thead th { padding:12px 20px; text-align:left; }
  tbody tr:nth-child(odd) { background:#f9f9f9; }
  tbody tr:nth-child(even) { background:#ffffff; }
  tbody td { padding:12px 20px; border-bottom:1px solid #ddd; }
  tbody td.price, tbody td.qty, tbody td.total { text-align:right; font-family:monospace; }
  .totals-container { margin:30px 40px; display:flex; justify-content:space-between; background:white; padding:18px 30px; box-shadow:0 2px 6px rgba(0,0,0,0.1); }
  .totals-container div { font-weight:700; color:#2a05bd; }
  section { margin:30px 40px; }
  footer { background:#fff; border-top:3px solid #9c207b; padding:20px 40px; display:flex; justify-content:space-between; font-family:monospace; color:#6d2e8d; font-size:14px; }
  .footer-left, .footer-center, .footer-right { display:flex; align-items:center; gap:12px; }
  .footer-icon { width:28px; height:28px; border-radius:50%; background:#9c207b; color:white; display:flex; justify-content:center; align-items:center; font-weight:700; font-size:14px; cursor:default; }
</style>
</head>
<body>
<div class="invoice">
  <header>
    <div class="logo">
      <img src="${companyLogo}" alt="Logo"/>
    </div>
    <h1 class="invoice-title">${companyName}</h1>
    <div>${companyAddress}</div>
    <div class="invoice-meta">
      <div>
        <div>Factura Nº${invoice.id}</div>
        <div>Date: ${formattedDate}</div>
      </div>
      <div class="billing-info">
        Cliente<br />
        <strong>${invoice.cliente}</strong><br />
        ${invoice.endereco || ""}
      </div>
    </div>
  </header>

  <table>
    <thead>
      <tr>
        <th>DESCRIÇÃO</th>
        <th>PREÇO</th>
        <th>QTD</th>
        <th>TOTAL</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.artigos?.map(
        (item: any) => `
        <tr>
          <td>${item.nome}</td>
          <td class="price">${item.preco.toFixed(2)}</td>
          <td class="qty">${item.quantidade}</td>
          <td class="total">${(item.preco * item.quantidade).toFixed(2)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals-container">
    <div>
      <div>SUBTOTAL: ${subtotal.toFixed(2)}</div>
      <div>Desc: ${impostoValor.toFixed(2)}</div>
      <div>Total: ${total.toFixed(2)}</div>
    </div>
    <div>
      <div>Informação de Pagamento</div>
      <div>IBAN</div>
      <div>0005 0000 5118 8259 1019 7</div>
    </div>
  </div>

  <section>
    <div>TERMOS E CONDIÇÕES:</div>
    <p style="color:#555; font-size:13px;">
      Em caso de litígio, ambas as partes concordam resolver pela via amigável. Persistindo o conflito, será seguido o foro judicial competente em Angola.
    </p>
  </section>

  <footer>
    <div class="footer-left"><span class="footer-icon">@</span>brilhonopontohigienizacao</div>
    <div class="footer-center"><span class="footer-icon">&#9993;</span>brilhonoponto25@gmail.com</div>
    <div class="footer-right"><span class="footer-icon">&#128241;</span>+244 947 006 930</div>
  </footer>
</div>
</body>
</html>
`;

    try {
      const { uri } = await Print.printToFileAsync({ html, width: 595, height: 842 });
      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível exportar a fatura.");
      console.error(error);
    }
  };

  if (!invoice) {
    return (
      <View style={styles.center}>
        <Text>Fatura não encontrada.</Text>
      </View>
    );
  }

  const subtotal =
    invoice.artigos?.reduce(
      (acc: number, item: any) => acc + item.preco * item.quantidade,
      0
    ) || 0;
  const impostoValor = invoice.impostoValor || 0;
  const total = invoice.total || subtotal + impostoValor;

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Voltar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={pickLogo}>
        <Image source={{ uri: typeof companyLogo === "string" ? companyLogo : Image.resolveAssetSource(companyLogo).uri }} style={{ width: 100, height: 100, resizeMode: 'contain', marginBottom: 16 }} />
      </TouchableOpacity>

      <TextInput
        style={[styles.clientName, { marginBottom: 4 }]}
        value={companyName}
        onChangeText={setCompanyName}
      />

      <TextInput
        style={[styles.clientAddress, { marginBottom: 16 }]}
        value={companyAddress}
        onChangeText={setCompanyAddress}
      />

      <Text style={styles.invoiceNumber}>Factura Nº{invoice.id}</Text>
      <Text style={styles.date}>{new Date(invoice.data).toLocaleDateString()}</Text>
      <Text style={styles.clientName}>{invoice.cliente}</Text>
      <Text style={styles.clientAddress}>{invoice.endereco}</Text>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.cell, { flex: 3 }]}>DESCRIÇÃO</Text>
          <Text style={[styles.cell, { flex: 1, textAlign: "right" }]}>PREÇO</Text>
          <Text style={[styles.cell, { flex: 1, textAlign: "right" }]}>QTD</Text>
          <Text style={[styles.cell, { flex: 1, textAlign: "right" }]}>TOTAL</Text>
        </View>
        {invoice.artigos?.map((item: any, index: number) => (
          <View
            key={index}
            style={[
              styles.tableRow,
              { backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff" },
            ]}
          >
            <Text style={[styles.cell2, { flex: 3 }]}>{item.nome}</Text>
            <Text style={[styles.cell2, { flex: 1, textAlign: "right" }]}>{item.preco.toFixed(2)}</Text>
            <Text style={[styles.cell2, { flex: 1, textAlign: "right" }]}>{item.quantidade}</Text>
            <Text style={[styles.cell2, { flex: 1, textAlign: "right" }]}>{(item.preco * item.quantidade).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.totalsContainer}>
        <Text>SUBTOTAL: {subtotal.toFixed(2)}</Text>
        <Text>Desc: {impostoValor.toFixed(2)}</Text>
        <Text style={{ fontWeight: "700" }}>TOTAL: {total.toFixed(2)}</Text>
      </View>

      <TouchableOpacity style={styles.exportBtn} onPress={exportPdf}>
        <Text style={styles.exportBtnText}>Exportar PDF</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  backButton: { padding: 8, backgroundColor: "#8a2387", borderRadius: 6, marginBottom: 16, alignSelf: "flex-start" },
  backButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  invoiceNumber: { fontSize: 18, fontWeight: "900", marginBottom: 6, color: "#2a05bd" },
  date: { fontSize: 16, fontWeight: "600", marginBottom: 12, color: "#5c2ea1" },
  clientName: { fontSize: 16, fontWeight: "600", marginBottom: 2, color: "#4a2a99" },
  clientAddress: { fontSize: 14, color: "#4a4a4a", marginBottom: 16 },
  table: { marginBottom: 16, borderRadius: 8, overflow: "hidden", borderWidth: 1, borderColor: "#ddd" },
  tableRow: { flexDirection: "row", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#ccc" },
  tableHeader: { backgroundColor: "#500443ff", color: "#fefefe" },
  cell: { fontSize: 14, paddingHorizontal: 8, color: "#fefefe" },
  cell2: { fontSize: 14, paddingHorizontal: 8, color: "#000" },
  totalsContainer: { marginVertical: 16, alignItems: "flex-end" },
  exportBtn: { backgroundColor: "#8a2387", paddingVertical: 16, borderRadius: 10, alignItems: "center", marginTop: 20 },
  exportBtnText: { color: "#fff", fontWeight: "700", fontSize: 18 },
});
