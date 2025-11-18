
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

// Veo Video Generation Types

export enum AspectRatio {
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16',
}

export enum Resolution {
  P720 = '720p',
  P1080 = '1080p',
}

export enum VeoModel {
  VEO = 'veo-3.1-generate-preview',
  VEO_FAST = 'veo-3.1-fast-generate-preview',
}

export enum GenerationMode {
  TEXT_TO_VIDEO = 'Text to Video',
  FRAMES_TO_VIDEO = 'Frames to Video',
  REFERENCES_TO_VIDEO = 'References to Video',
  EXTEND_VIDEO = 'Extend Video',
}

export interface ImageFile {
  file: File;
  base64: string;
}

export interface VideoFile {
  file: File;
  base64: string;
}

export interface GenerateVideoParams {
  prompt: string;
  model: VeoModel;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  mode: GenerationMode;
  startFrame: ImageFile | null;
  endFrame: ImageFile | null;
  referenceImages: ImageFile[];
  styleImage: ImageFile | null;
  inputVideo: VideoFile | null;
  inputVideoObject: Video | null;
  isLooping: boolean;
}
