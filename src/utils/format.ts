// Formatar valor em moeda angolana
export const formatCurrency = (value: number, currency = "Kz") => {
  if (!value) return `0.00 ${currency}`;
  return `${Number(value).toFixed(2)} ${currency}`;
};

// Gerar ID seguro sem crypto (compatível com Expo)
export const uid = () => {
  return (
    Math.random().toString(36).substring(2, 10) +
    Date.now().toString(36)
  );
};
