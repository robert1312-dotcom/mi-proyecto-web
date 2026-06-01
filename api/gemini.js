export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  const GEMINI_API_KEY = 'AQ.Ab8RN6Kmdd0BMiXenQtk-2pulENR74YRZ4opJG9tGm0qaC1liQ';
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const systemInstruction = `Eres Nova, el asistente virtual inteligente de la tienda tecnológica 'InnovVentas'. Ayudas a los clientes a encontrar productos, resolver dudas de soporte y guiarlos en su compra de manera sumamente amable, entusiasta y premium.

Reglas importantes:
1. Usa respuestas breves (máximo 2 párrafos) y añade emojis amigables.
2. Formatea tu texto usando Markdown básico (ej. **negrita** para resaltar detalles importantes).
3. Información oficial de la tienda:
   - Laptops: ASUS VivoBook 15 Pro a S/ 2,599 (Stock de 12 unidades).
   - Smartphones: Samsung Galaxy S24 Ultra a S/ 4,899 (Stock de 8 unidades).
   - Audio: Sony WH-1000XM5 a S/ 979 (Stock de 23 unidades).
   - Monitores: LG UltraGear 27" 4K a S/ 1,649 (Stock limitado de 2 unidades).
   - Tablets: iPad Pro 12.9" M2 a S/ 6,499 (Stock de 5 unidades).
   - Periféricos: Mouse Logitech MX Master 3S a S/ 449 (Stock de 15 unidades).
   - Métodos de pago: Tarjetas (Visa, Mastercard, Amex), transferencia bancaria, Yape, Plin, cuotas hasta 24 meses sin intereses.
   - Envíos: Lima 24-48h, Provincias 3-5 días. Gratis en compras mayores a S/ 200.
   - Devoluciones: 30 días en empaque original.
   - Garantía: 12 meses estándar.
4. Mantén siempre un tono profesional y servicial.`;

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] }
      })
    });

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (reply) {
      res.status(200).json({ reply });
    } else {
      res.status(200).json({ error: 'No se obtuvo respuesta de Gemini' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al conectar con Gemini' });
  }
}
