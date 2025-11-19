/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Video } from '@google/genai';

export enum AppView {
  DASHBOARD = 'dashboard',
  CRY_ANALYZER = 'cry_analyzer',
  CONSULTANT = 'consultant',
  MAPS = 'maps',
  RECIPES = 'recipes',
  COMMUNITY = 'community',
  SOUNDS = 'sounds',
  PREGNANCY = 'pregnancy',
}

export enum SpecialistType {
  PEDIATRICIAN = 'Pediatra',
  PSYCHOLOGIST = 'Psicóloga',
  NUTRITIONIST = 'Nutricionista',
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface CryAnalysisResult {
  category: string;
  probability: number;
  advice: string;
  emotionalTone: string;
}

export interface MapPlace {
  id: string;
  name: string;
  address: string;
  rating: number;
  isOpen: boolean;
  distance: string;
  lat?: number;
  lng?: number;
  type: 'hospital' | 'pharmacy' | 'park' | 'store';
  uri?: string; // Added uri to MapPlace interface
}

export interface PlaceResult {
  name: string;
  address?: string;
  rating?: number;
  uri?: string;
}

export interface Recipe {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  benefits: string;
}

export interface SoundTrack {
  id: string;
  title: string;
  category: 'baby' | 'nature' | 'womb' | 'mom';
  youtubeId: string;
  duration: string;
  color: string;
}

export interface PregnancyWeek {
  week: number;
  sizeComparison: string;
  fruit: string; // Emoji or name
  weight: string;
  length: string;
  description: string;
  development: string;
  nutrition: string; // Foods to eat
  avoid: string; // Foods/Meds to avoid
  healthTip: string; // General health advice
}