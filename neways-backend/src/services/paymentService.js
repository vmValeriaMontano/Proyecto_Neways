async function processPayment(paymentDetails) {
  // Simulación del procesamiento de tarjetas[cite: 5]
  const { cardNumber, cardName, expiry, cvc } = paymentDetails;

  if (!cardNumber || !cardName || !expiry || !cvc) {
    return { success: false, message: "Información de tarjeta incompleta." };
  }

  const cleanCard = cardNumber.replace(/\s+/g, '');
  if (cleanCard.length < 15 || cleanCard.length > 16) {
    return { success: false, message: "Número de tarjeta inválido." };
  }

  // Simulación de respuesta de pasarela
  return {
    success: true,
    transactionId: "TXN-" + Math.floor(100000 + Math.random() * 900000),
    message: "Pago autorizado correctamente."
  };
}

module.exports = { processPayment };