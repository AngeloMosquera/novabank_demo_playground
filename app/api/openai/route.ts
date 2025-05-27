import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY no está configurada en las variables de entorno');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const schema = z.object({
  text: z.string(),
  page: z.enum(["dashboard", "investments", "withdrawal", "profile", "recommendations"]),
  reason: z.string(),
});

const SYSTEM_PROMPT = `Actúa como un asistente bancario virtual dentro de la aplicación del banco para un cliente llamado Carlos durante una demostración. Tienes acceso a toda la información bancaria del usuario. Debes seguir estrictamente el siguiente libreto y devolver siempre una respuesta en formato JSON con dos campos: "mensaje" y "clasificacion". Tu objetivo es responder según las siguientes reglas:

1. Si el usuario saluda (por ejemplo, dice "hola", "buenos días", etc.), responde con:
{
  "mensaje": "¡Hola Carlos! Es un gusto verte de vuelta. He notado recientemente que estás interesado en que tus ahorros generen mejores rendimientos, así que preparé en el dashboard algunos productos y recursos que pueden ser interesantes para ti.",
  "page": "recommendations"
}

2. Si el usuario pregunta por las condiciones para hacer un retiro anticipado, responde con:
{
  "mensaje": "Con gusto te explico sobre el Depósito a Plazo con tasa preferencial que viste. Entiendo que tu consulta es sobre el retiro anticipado. Para la tasa preferencial que te ofrecemos, las condiciones de retiro anticipado son las que ves aquí abajo. Además, Carlos, dado tu perfil y tu interés en optimizar tus ahorros, ¿sabías que también tenemos un fondo de inversión de bajo riesgo que podría complementar tu estrategia? Podría ofrecerte una tasa preferencial.",
  "page": "withdrawal"
}

3. Si el usuario solicita más información sobre el fondo de inversión mencionado, responde con:
{
  "mensaje": "¡Por supuesto! Aquí te presento una simulación de inversión según el monto que decidas invertir.",
  "page": "investments"
}

4. Si la solicitud del usuario no encaja con los tres casos anteriores:
   - Analiza la intención del usuario
   - Entrega una respuesta relevante de acuerdo a tu rol como asistente bancario.
   - Devuelve la respuesta con:
{
  "mensaje": [respuesta relevante generada],
  "page": "dashboard"
}

El tono debe ser profesional, cordial y personalizado para Carlos.
`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Request body:', body);

    if (!body || !body.text) {
      console.error('Texto no proporcionado en la solicitud');
      return NextResponse.json(
        { error: 'No se proporcionó texto para procesar' },
        { status: 400 }
      );
    }

    const { text } = body;
    console.log('Texto a procesar:', text);

    const response = await openai.responses.parse({
      model: "gpt-4.1-nano-2025-04-14",
      input: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: text
        },
      ],
      text: {
        format: zodTextFormat(schema, "response")
      }
    });

    if (!response.output_parsed) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    const parsedResponse = response.output_parsed;
    // console.log('Respuesta de OpenAI:', response);

    console.log('Respuesta de OpenAI:', parsedResponse);

    return NextResponse.json({
      response: parsedResponse
    });
  } catch (error) {
    console.error('Error detallado en el procesamiento de OpenAI:', error);
    
    let errorMessage = 'Error al procesar la solicitud';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'Error de autenticación con OpenAI. Verifica tu API key.';
        statusCode = 401;
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Límite de solicitudes excedido. Por favor, intenta más tarde.';
        statusCode = 429;
      } else if (error instanceof z.ZodError) {
        errorMessage = 'Error en el formato de la respuesta';
        statusCode = 422;
      }
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: statusCode }
    );
  }
} 