import AsyncStorage from "@react-native-async-storage/async-storage";

/* ========================
   CHAVES DE ARMAZENAMENTO
======================== */
const CLIENTS_KEY = "@clients_v1";
const PRODUCTS_KEY = "@products_v1";
const FACTURAS_KEY = "@facturas_v1";

/* ========================
   CLIENTES
======================== */
export async function getClients(): Promise<any[]> {
  const raw = await AsyncStorage.getItem(CLIENTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveClient(client: any) {
  const list = await getClients();
  const index = list.findIndex((c) => c.id === client.id);

  if (index > -1) list[index] = client;
  else list.unshift(client);

  await AsyncStorage.setItem(CLIENTS_KEY, JSON.stringify(list));
}

export async function deleteClient(id: string) {
  const list = await getClients();
  const filtered = list.filter((c) => c.id !== id);
  await AsyncStorage.setItem(CLIENTS_KEY, JSON.stringify(filtered));
}

/* ========================
   PRODUTOS
======================== */
export async function getProducts(): Promise<any[]> {
  const raw = await AsyncStorage.getItem(PRODUCTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveProduct(product: any) {
  const list = await getProducts();
  const index = list.findIndex((p) => p.id === product.id);

  if (index > -1) list[index] = product;
  else list.unshift(product);

  await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(list));
}

export async function deleteProduct(id: string) {
  const list = await getProducts();
  const filtered = list.filter((p) => p.id !== id);
  await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(filtered));
}

/* ========================
   FACTURAS
======================== */
export async function getFacturas(): Promise<any[]> {
  const raw = await AsyncStorage.getItem(FACTURAS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export const getInvoices = getFacturas; // <-- Alias existente

export async function saveFactura(factura: any) {
  const list = await getFacturas();
  const index = list.findIndex((f) => f.id === factura.id);

  if (index > -1) list[index] = factura;
  else list.unshift(factura);

  await AsyncStorage.setItem(FACTURAS_KEY, JSON.stringify(list));
}

// Alias para compatibilidade com saveInvoice
export const saveInvoice = saveFactura;

// ========================
// Deletar fatura
// ========================
export async function deleteFactura(id: string) {
  const list = await getFacturas();
  const filtered = list.filter((f) => f.id !== id);
  await AsyncStorage.setItem(FACTURAS_KEY, JSON.stringify(filtered));
}

// Alias para compatibilidade
export const deleteInvoice = deleteFactura;

/* ========================
   LIMPAR DADOS (opcional)
======================== */
export async function clearAllStorage() {
  await AsyncStorage.multiRemove([CLIENTS_KEY, PRODUCTS_KEY, FACTURAS_KEY]);
}
