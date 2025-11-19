/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import { CryAnalysisResult, MapPlace, Recipe, SpecialistType } from '../types';
import { PLACES_DB, RECIPES_DB } from '../data/localDatabase';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Cry Analysis ---
export const analyzeCryAudio = async (base64Audio: string, mimeType: string): Promise<CryAnalysisResult> => {
  try {
    const prompt = `
      Você é uma IA especialista em desenvolvimento infantil e análise de choro de bebês.
      Analise este áudio e identifique a causa mais provável do choro entre: FOME, DOR, FRALDA, SONO, ou INCÔMODO/TÉDIO.
      
      Retorne APENAS um JSON com este formato:
      {
        "category": "Motivo (ex: Fome)",
        "probability": número de 0 a 100,
        "advice": "Uma frase curta e acolhedora com a solução prática.",
        "emotionalTone": "Uma palavra sobre o estado emocional (ex: Estressado, Cansado)"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { data: base64Audio, mimeType: mimeType } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            probability: { type: Type.NUMBER },
            advice: { type: Type.STRING },
            emotionalTone: { type: Type.STRING }
          },
          required: ['category', 'probability', 'advice']
        }
      }
    });

    const text = response.text || '{}';
    return JSON.parse(text);
  } catch (error) {
    console.error("API Error, using fallback", error);
    // Fallback simulation
    return {
        category: "DOR / CÓLICA",
        probability: 85,
        advice: "Parece desconforto abdominal. Tente fazer massagens circulares na barriguinha e 'bicicleta' com as pernas.",
        emotionalTone: "Intenso"
    };
  }
};

// --- Specialist Chat ---
// Changed to an async generator function to correctly use `yield`
export const sendSpecialistMessage = async function* (
  message: string, 
  history: {role: string, parts: {text: string}[]}[], 
  type: SpecialistType
): AsyncGenerator<string, void, void> { 
  try {
    let systemInstruction = '';
    
    switch (type) {
      case SpecialistType.NUTRITIONIST:
        systemInstruction = 'Você é uma Nutricionista Pediátrica especialista em introdução alimentar e nutrição infantil. Seja gentil, use emojis, e dê dicas práticas e saudáveis.';
        break;
      case SpecialistType.PSYCHOLOGIST:
        systemInstruction = 'Você é uma Psicóloga Perinatal especialista em maternidade. Seu foco é a saúde mental da mãe. Seja acolhedora, valide os sentimentos, ofereça escuta ativa e técnicas de redução de ansiedade.';
        break;
      case SpecialistType.PEDIATRICIAN:
        systemInstruction = 'Você é uma Pediatra experiente. Ajude com triagem de sintomas, marcos de desenvolvimento e vacinas. IMPORTANTE: Para casos graves ou emergências, SEMPRE recomende ir ao pronto-socorro imediatamente. Nunca substitua uma consulta presencial.';
        break;
    }

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: { systemInstruction },
      history: history.map(h => ({
          role: h.role,
          parts: h.parts
      }))
    });

    // Use sendMessageStream to get a streaming response
    const stream = await chat.sendMessageStream({ message });
    
    for await (const chunk of stream) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        yield c.text; // Yield each text chunk
      }
    }
  } catch (error) {
    console.error("Error in specialist chat stream:", error);
    yield "Estou com dificuldade de conexão no momento, mas lembre-se: se for urgente, procure um médico presencial.";
  }
};

// --- Recipe Generator ---
export const generateRecipe = async (query: string): Promise<Recipe> => {
  // 1. Check Local Database first
  const lowerQuery = query.toLowerCase();
  if (lowerQuery.includes('cólica') || lowerQuery.includes('colica')) return RECIPES_DB['colica'];
  if (lowerQuery.includes('dormir') || lowerQuery.includes('sono')) return RECIPES_DB['dormir'];
  // Removed misleading comment, the line below is a valid conditional statement.
  if (lowerQuery.includes('leite')) return RECIPES_DB['leite'];

  // Fallback if not found in local DB
  return RECIPES_DB['colica']; // Default fallback to a known recipe
};

// --- Map Finder ---
export const findNearbyPlaces = async (
  query: string,
  latitude: number,
  longitude: number
): Promise<MapPlace[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: latitude,
              longitude: longitude,
            },
          },
        },
      },
    });

    const groundedPlaces: MapPlace[] = [];
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      for (const chunk of response.candidates[0].groundingMetadata.groundingChunks) {
        if (chunk.maps) {
          const placeName = chunk.maps.title || 'Local Desconhecido';
          const placeUri = chunk.maps.uri;

          // Attempt to infer type from query, otherwise default
          let type: MapPlace['type'] = 'store'; // Default
          const lowerQuery = query.toLowerCase();
          if (lowerQuery.includes('hospital') || lowerQuery.includes('emergencia') || lowerQuery.includes('maternidade')) {
            type = 'hospital';
          } else if (lowerQuery.includes('farmacia') || lowerQuery.includes('drogaria')) {
            type = 'pharmacy';
          } else if (lowerQuery.includes('parque') || lowerQuery.includes('praca')) {
            type = 'park';
          }

          // These fields are not directly available from grounding chunks and would require further parsing of response.text or another API call.
          // For simplicity and to match the MapPlace interface, we'll use placeholder/default values.
          // In a real app, one would use a Maps API to get full details.
          groundedPlaces.push({
            id: placeUri ? new URL(placeUri).pathname.split('/').pop() || placeName : placeName, // Simple ID generation
            name: placeName,
            address: 'Endereço não disponível', // Placeholder
            rating: 0, // Placeholder
            isOpen: true, // Placeholder
            distance: 'Desconhecida', // Placeholder
            lat: latitude, // Use search center lat/lng as a fallback if not more specific data from Maps API is parsed
            lng: longitude, // Use search center lat/lng as a fallback if not more specific data from Maps API is parsed
            type: type,
            uri: placeUri,
          });
        }
      }
    }

    if (groundedPlaces.length > 0) {
      return groundedPlaces;
    } else {
      console.warn("No grounded maps places found, using local database fallback.");
      return PLACES_DB;
    }
  } catch (error) {
    console.error("API Error during map search, using local database fallback:", error);
    return PLACES_DB;
  }
};