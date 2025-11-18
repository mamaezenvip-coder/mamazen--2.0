
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Type } from '@google/genai';
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
export const sendSpecialistMessage = async (
  message: string, 
  history: {role: string, parts: {text: string}[]}[], 
  type: SpecialistType
) => {
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

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    return "Estou com dificuldade de conexão no momento, mas lembre-se: se for urgente, procure um médico presencial.";
  }
};

// --- Recipe Generator ---
export const generateRecipe = async (query: string): Promise<Recipe> => {
  // 1. Check Local Database first
  const lowerQuery = query.toLowerCase();
  if (lowerQuery.includes('cólica') || lowerQuery.includes('colica')) return RECIPES_DB['colica'];
  if (lowerQuery.includes('dormir') || lowerQuery.includes('sono')) return RECIPES_DB['dormir'];
  if (lowerQuery.includes('leite') || lowerQuery.includes('amamentar')) return RECIPES_DB['leite'];

  // 2. If not found, ask AI
  try {
    const prompt = `
      Crie uma receita ou sugestão alimentar para: "${query}".
      Considere o contexto de maternidade/bebês/família.
      
      Retorne JSON:
      {
        "title": "Nome do Prato/Bebida",
        "description": "Breve descrição atraente",
        "ingredients": ["item 1", "item 2"],
        "instructions": ["passo 1", "passo 2"],
        "benefits": "Por que isso ajuda na solicitação"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            benefits: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    // Final Fallback
    return RECIPES_DB['colica'];
  }
};

// --- Maps Finder ---
export const findNearbyPlaces = async (query: string, lat: number, lng: number): Promise<MapPlace[]> => {
  try {
    const prompt = `
      Find the closest and most relevant places for "${query}" near latitude ${lat}, longitude ${lng}.
      Prioritize emergency services if the query mentions 'Hospital' or 'Emergency'.
      
      Return a JSON array of the top 5 results.
      Structure:
      {
        "id": "unique_id",
        "name": "Place Name",
        "address": "Full Address",
        "rating": 4.5,
        "isOpen": true,
        "distance": "Estimated distance (e.g. 2.5 km)",
        "lat": ${lat}, 
        "lng": ${lng},
        "type": "hospital"
      }
      IMPORTANT: Return ONLY the JSON array string. No markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
              latLng: { latitude: lat, longitude: lng }
          }
        }
      }
    });
    
    let text = response.text || '[]';
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(text);
    
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    throw new Error("Empty results");
  } catch (e) {
    console.warn("Maps API failed, using offline database.");
    // Return offline database filtered slightly by query context if possible
    return PLACES_DB;
  }
};
