export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  const GEMINI_API_KEY = 'AQ.Ab8RN6Kmdd0BMiXenQtk-2pulENR74YRZ4opJG9tGm0qaC1liQ';
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Eres Nova, el asistente virtual de InnovVentas, una tienda de tecnología peruana.
Responde en español, de forma amable y concisa (máximo 3 oraciones).
Solo responde sobre tecnología, productos electrónicos o consultas de la tienda.
Consulta del cliente: ${message}`
          }]
        }]
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
