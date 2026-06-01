<?php
/**
 * InnovVentas – Gemini AI Proxy API
 * Actúa como intermediario seguro para no exponer la clave API en el navegador.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST');

// Si es una petición OPTIONS (CORS preflight), responder con éxito de inmediato
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config.php';

// Validar que se haya ingresado la clave API
if (!defined('GEMINI_API_KEY') || GEMINI_API_KEY === 'TU_API_KEY_AQUI' || empty(GEMINI_API_KEY)) {
    echo json_encode([
        'error' => 'API Key no configurada. Por favor, edita el archivo config.php e ingresa tu API Key de Gemini.'
    ]);
    exit;
}

// Obtener el cuerpo de la petición POST
$input = json_decode(file_get_contents('php://input'), true);
$message = $input['message'] ?? '';

if (empty(trim($message))) {
    echo json_encode(['error' => 'El mensaje de usuario está vacío.']);
    exit;
}

// URL de la API de Gemini 2.5 Flash (El modelo 1.5 ha sido retirado)
$url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' . GEMINI_API_KEY;

// Instrucciones del sistema para darle personalidad a la IA
$systemInstruction = "Eres Nova, el asistente virtual inteligente de la tienda tecnológica 'InnovVentas'. Ayudas a los clientes a encontrar productos, resolver dudas de soporte y guiarlos en su compra de manera sumamente amable, entusiasta y premium.\n\n"
    . "Reglas importantes:\n"
    . "1. Usa respuestas breves (máximo 2 párrafos) y añade emojis amigables.\n"
    . "2. Formatea tu texto usando Markdown básico (ej. **negrita** para resaltar detalles importantes o nombres, pero no abuses).\n"
    . "3. Adhiérete estrictamente a la información oficial de la tienda:\n"
    . "   - Laptops: ASUS VivoBook 15 Pro a S/ 2,599 (Stock de 12 unidades).\n"
    . "   - Smartphones: Samsung Galaxy S24 Ultra a S/ 4,899 (Stock de 8 unidades).\n"
    . "   - Audio: Sony WH-1000XM5 a S/ 979 (Stock de 23 unidades).\n"
    . "   - Monitores: LG UltraGear 27\" 4K a S/ 1,649 (Stock limitado de 2 unidades).\n"
    . "   - Tablets: iPad Pro 12.9\" M2 a S/ 6,499 (Stock de 5 unidades).\n"
    . "   - Periféricos: Mouse Logitech MX Master 3S a S/ 449 (Stock de 15 unidades).\n"
    . "   - Métodos de pago: Tarjetas de crédito/débito (Visa, Mastercard, Amex), transferencia bancaria (BCP, Interbank, BBVA, Scotiabank), Yape y Plin, y pago en cuotas (hasta 24 meses sin intereses con tarjetas asociadas).\n"
    . "   - Envíos: Lima Metropolitana (24 a 48 horas útiles), Provincias (3 a 5 días útiles). Envío GRATIS en compras mayores a S/ 200. Envío express disponible por S/ 15 adicionales.\n"
    . "   - Devoluciones: 30 días de plazo para solicitar una devolución sin costo (debe estar en su empaque original con accesorios).\n"
    . "   - Garantía: 12 meses de garantía estándar en todos los productos por fallas de hardware o defectos de fábrica.\n"
    . "4. Si un usuario quiere agregar un producto al carrito, dile que puede hacer clic en el botón 'Agregar' del producto en la página, o simplemente anímalo a comprar.\n"
    . "5. Mantén siempre un tono profesional y servicial.";

$data = [
    'contents' => [
        [
            'parts' => [
                ['text' => $message]
            ]
        ]
    ],
    'systemInstruction' => [
        'parts' => [
            ['text' => $systemInstruction]
        ]
    ]
];

// Configurar cURL
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 15); // Límite de 15 segundos para la respuesta

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($httpCode !== 200) {
    $errDetail = json_decode($response, true);
    $msgError = $errDetail['error']['message'] ?? $curlError ?? 'Error desconocido';
    echo json_encode([
        'error' => 'Error al comunicarse con la API de Gemini: ' . $msgError
    ]);
    exit;
}

$responseData = json_decode($response, true);
$replyText = $responseData['candidates'][0]['content']['parts'][0]['text'] ?? 'Lo siento, no pude procesar tu respuesta en este momento.';

echo json_encode([
    'reply' => $replyText
]);
