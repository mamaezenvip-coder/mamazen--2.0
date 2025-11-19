/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef } from 'react';
import { analyzeCryAudio } from '../services/geminiService';
import { CryAnalysisResult } from '../types';
import { MicIcon, PlayIcon, SparklesIcon, StopIcon } from './icons';

const CryAnalyzer: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<CryAnalysisResult | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        setIsAnalyzing(true);
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          try {
            const analysis = await analyzeCryAudio(base64, 'audio/webm');
            setResult(analysis);
          } catch (error) {
            console.error('Error analyzing cry:', error);
            alert('Erro ao analisar o choro. Tente novamente.');
          } finally {
            setIsAnalyzing(false);
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
      setResult(null);
    } catch (err) {
      console.error('Error accessing microphone', err);
      alert('Precisamos de acesso ao microfone para ouvir o bebê.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-primary">Ouvir Choro</h2>
        <p className="text-gray-500">Aproxime o celular do bebê e grave por alguns segundos.</p>
      </div>

      {/* Visualization / Button Circle */}
      <div className="relative">
        {isRecording && (
          <div className="absolute inset-0 rounded-full bg-pink-200 animate-ping opacity-75"></div>
        )}
        <div className="relative z-10 w-48 h-48 rounded-full bg-white shadow-xl border-4 border-pink-100 flex items-center justify-center">
           <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isAnalyzing}
            className={`w-40 h-40 rounded-full flex items-center justify-center transition-all transform hover:scale-105 ${
              isRecording ? 'bg-red-400 text-white' : 'bg-primary text-white'
            } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isAnalyzing ? (
              <SparklesIcon className="w-12 h-12 animate-spin" />
            ) : isRecording ? (
              <StopIcon className="w-12 h-12" />
            ) : (
              <MicIcon className="w-16 h-16" />
            )}
          </button>
        </div>
      </div>
      
      {isRecording && <p className="text-red-400 font-medium animate-pulse">Gravando... Toque para parar</p>}
      {isAnalyzing && <p className="text-primary font-medium animate-pulse">Analisando com IA...</p>}

      {result && (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in-up">
          <div className="bg-gradient-to-r from-secondary to-blue-200 p-6 text-center">
            <span className="text-blue-800 font-bold tracking-wide text-sm uppercase opacity-70">Resultado</span>
            <h3 className="text-3xl font-bold text-blue-900 mt-1">{result.category}</h3>
            <div className="flex justify-center mt-2">
                <span className="bg-white/30 px-3 py-1 rounded-full text-sm font-medium text-blue-900">
                    {result.probability}% de certeza
                </span>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-start gap-3 mb-4">
                <div className="bg-pink-100 p-2 rounded-lg mt-1">
                    <SparklesIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h4 className="font-bold text-gray-700">O que fazer:</h4>
                    <p className="text-gray-600 leading-relaxed">{result.advice}</p>
                </div>
            </div>
            <div className="text-center pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-400">Tom emocional: {result.emotionalTone}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CryAnalyzer;