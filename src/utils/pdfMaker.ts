import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";

export async function gerarPDF(invoice: any) {
  const html = `
  <html>
    <body style="font-family: Arial; padding: 20px;">
      <h1 style="text-align: center;">Factura</h1>
      <h3>Cliente: ${invoice.cliente}</h3>
      <p>Data: ${new Date(invoice.data).toLocaleDateString("pt-AO")}</p>

      <h2>Produtos</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <th style="border-bottom: 1px solid #000; text-align: left;">Produto</th>
          <th style="border-bottom: 1px solid #000;">Qtd</th>
          <th style="border-bottom: 1px solid #000;">Preço</th>
          <th style="border-bottom: 1px solid #000;">Total</th>
        </tr>

        ${invoice.produtos
          .map(
            (p: any) => `
          <tr>
            <td>${p.nome}</td>
            <td style="text-align: center;">${p.quantidade}</td>
            <td style="text-align: center;">${p.preco}</td>
            <td style="text-align: center;">${p.preco * p.quantidade}</td>
          </tr>
        `
          )
          .join("")}
      </table>

      <h2>Total</h2>
      <p>Subtotal: ${invoice.subtotal}</p>
      <p>Imposto (${invoice.imposto}%): ${(invoice.subtotal * invoice.imposto) / 100}</p>
      <p>Desconto (${invoice.desconto}%): ${(invoice.subtotal * invoice.desconto) / 100}</p>
      <h3>Total Final: ${invoice.total}</h3>
    </body>
  </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });

  const newPath = FileSystem.documentDirectory + `factura_${invoice.id}.pdf`;
  await FileSystem.moveAsync({ from: uri, to: newPath });

  return newPath;
}
