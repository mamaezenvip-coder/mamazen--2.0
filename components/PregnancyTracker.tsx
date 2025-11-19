/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { PREGNANCY_WEEKS_DB } from '../data/localDatabase';
import { ArrowLeftIcon, DnaIcon, SparklesIcon, BabyIcon, MaximizeIcon, UtensilsIcon, AlertIcon, StethoscopeIcon } from './icons';

const PregnancyTracker: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [setupCompleted, setSetupCompleted] = useState(false);
  const [lmpDate, setLmpDate] = useState('');
  const [currentWeek, setCurrentWeek] = useState(4); 
  const [dueDate, setDueDate] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load saved data on mount
  useEffect(() => {
    const savedLmp = localStorage.getItem('mamaezen_lmp');
    if (savedLmp) {
        calculatePregnancyData(savedLmp);
        setSetupCompleted(true);
    }
  }, []);

  const calculatePregnancyData = (dateString: string) => {
    const start = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    
    // Due date is LMP + 280 days
    const due = new Date(start);
    due.setDate(start.getDate() + 280);
    
    setLmpDate(dateString);
    setDueDate(due.toLocaleDateString('pt-BR'));
    
    // Clamp weeks between 4 and 40 for the DB
    const clampedWeek = Math.max(4, Math.min(40, weeks));
    setCurrentWeek(clampedWeek);
  };

  const handleSetup = (e: React.FormEvent) => {
      e.preventDefault();
      if (lmpDate) {
          localStorage.setItem('mamaezen_lmp', lmpDate);
          calculatePregnancyData(lmpDate);
          setSetupCompleted(true);
      }
  };

  // Find nearest available data if specific week is missing in simplified DB
  const availableWeeks = Object.keys(PREGNANCY_WEEKS_DB).map(Number).sort((a,b) => a-b);
  // Simple logic to find closest week in DB (e.g. if week 22, show week 21 data)
  const dataWeek = availableWeeks.reduce((prev, curr) => Math.abs(curr - currentWeek) < Math.abs(prev - currentWeek) ? curr : prev);
  const weekData = PREGNANCY_WEEKS_DB[dataWeek];

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [currentWeek]);

  // Generate array of weeks 4-40 for the scroller
  const allWeeks = Array.from({length: 37}, (_, i) => i + 4);

  const progressPercent = Math.min(100, Math.round((currentWeek / 40) * 100));
  const daysLeft = Math.max(0, (40 - currentWeek) * 7);

  // --- ONBOARDING SCREEN ---
  if (!setupCompleted) {
      return (
          <div className="min-h-screen bg-[#fff0f3] flex flex-col items-center justify-center p-6 text-center">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-pink-100 w-full max-w-sm">
                  <div className="bg-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <DnaIcon className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Vamos configurar!</h2>
                  <p className="text-gray-500 mb-8 text-sm">Para criar o modelo 3D preciso do seu bebê, precisamos saber a data da sua última menstruação (DUM).</p>
                  
                  <form onSubmit={handleSetup} className="space-y-6">
                      <div className="text-left">
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-2">Data da Última Menstruação</label>
                          <input 
                            type="date" 
                            required
                            value={lmpDate}
                            onChange={(e) => setLmpDate(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-700 focus:ring-2 focus:ring-primary/50 outline-none"
                          />
                      </div>
                      <button 
                        type="submit"
                        className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-pink-200 hover:bg-pink-500 transition-colors"
                      >
                          Gerar Bebê 3D
                      </button>
                  </form>
              </div>
          </div>
      );
  }

  // --- MAIN TRACKER VIEW ---
  return (
    <div className="min-h-screen bg-[#fff0f3] font-sans pb-24 flex flex-col">
        {/* Header Navigation */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md z-30 px-4 py-2 border-b border-pink-100">
             <div className="flex items-center justify-between mb-4">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
                </button>
                <div className="text-center">
                    <h1 className="font-bold text-lg text-gray-800">Minha Gravidez</h1>
                    <p className="text-[10px] text-gray-400">Previsto: {dueDate}</p>
                </div>
                <button onClick={() => setSetupCompleted(false)} className="text-xs text-primary font-bold px-3 py-1 bg-pink-50 rounded-full">
                    Editar
                </button>
            </div>

            {/* Horizontal Week Scroller */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" ref={scrollRef}>
                {allWeeks.map(week => (
                    <button
                        key={week}
                        onClick={() => setCurrentWeek(week)}
                        className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
                            currentWeek === week 
                            ? 'bg-gray-800 text-white shadow-lg transform scale-105' 
                            : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        {week} semanas
                    </button>
                ))}
            </div>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            
            {/* MAIN 3D CARD */}
            <div className="relative w-full aspect-[4/5] bg-[#ffc2d1] rounded-[2.5rem] p-8 flex flex-col shadow-2xl shadow-pink-200 overflow-hidden group">
                
                {/* Background Glows */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-300/50 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-400/30 rounded-full blur-3xl -ml-20 -mb-20"></div>

                {/* Top Text */}
                <div className="relative z-10">
                    <h2 className="text-3xl font-black text-[#1f1f1f] tracking-tight mb-2">
                        Hey, MAMAEZEN
                    </h2>
                    <p className="text-[#1f1f1f]/80 font-medium text-lg leading-snug max-w-[80%]">
                        Veja como seu pequeno <br/>está com {currentWeek} semanas!
                    </p>
                </div>

                {/* 3D BABY VISUALIZATION CENTER */}
                <div className="flex-1 relative flex items-center justify-center">
                    {/* The "3D" Representation */}
                    <div className={`relative transition-all duration-700 transform ${isAnimating ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`}>
                         {/* Umbilical Cord Effect */}
                         <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-40 pointer-events-none" viewBox="0 0 200 200">
                            <path d="M 40 100 Q 100 180 160 100" fill="none" stroke="#be185d" strokeWidth="8" strokeLinecap="round" className="drop-shadow-md" />
                         </svg>
                         
                         {/* Baby Icon with 3D CSS Filters */}
                         <div className="relative z-10 filter drop-shadow-[0_15px_15px_rgba(168,20,60,0.3)]">
                            <BabyIcon 
                                className="w-48 h-48 text-pink-50" 
                                strokeWidth={0.5}
                                fill="url(#skinGradient)"
                            />
                            {/* SVG Gradient Definition */}
                            <svg width="0" height="0">
                                <linearGradient id="skinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#ffe4e6" />
                                    <stop offset="50%" stopColor="#fecdd3" />
                                    <stop offset="100%" stopColor="#fda4af" />
                                </linearGradient>
                            </svg>
                         </div>

                         {/* Realistic Lighting Overlay */}
                         <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-full blur-sm pointer-events-none"></div>
                    </div>
                </div>

                {/* Bottom Card Info */}
                <div className="relative z-10 flex justify-between items-end">
                    <div>
                        <span className="text-5xl font-black text-[#1f1f1f]">{currentWeek}</span>
                        <span className="text-xl font-medium text-[#1f1f1f]/70 ml-1">semanas</span>
                    </div>
                    <button className="bg-white/20 p-3 rounded-full backdrop-blur-md hover:bg-white/30 transition-colors">
                        <MaximizeIcon className="w-6 h-6 text-[#1f1f1f]" />
                    </button>
                </div>
            </div>

            {/* DATA GRID - STATS */}
            <div className="grid grid-cols-2 gap-4">
                {/* SIZE CARD */}
                <div className="bg-[#fff5f7] p-5 rounded-[2rem] flex flex-col justify-between h-40 shadow-sm border border-pink-50">
                    <h3 className="font-bold text-gray-800 text-sm uppercase">Tamanho Est.</h3>
                    <div className="flex flex-col items-center justify-center flex-1">
                        <div className="text-4xl mb-1 drop-shadow-md">{weekData.fruit}</div>
                        <span className="font-bold text-gray-600 text-xs capitalize text-center">{weekData.sizeComparison}</span>
                    </div>
                    <div className="text-center text-[10px] text-gray-400">~{weekData.length}</div>
                </div>

                {/* PROGRESS CARD */}
                <div className="bg-[#fff5f7] p-5 rounded-[2rem] flex flex-col justify-between h-40 shadow-sm border border-pink-50 relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 right-0 h-[52%] bg-pink-200/30 rounded-b-[2rem] z-0"></div>
                    <div className="relative z-10 flex justify-between items-start">
                        <h3 className="font-bold text-gray-800 text-sm uppercase">Peso Est.</h3>
                        <span className="bg-white px-2 py-1 rounded-full text-[10px] font-bold text-gray-500 border border-gray-100">
                            {daysLeft} dias
                        </span>
                    </div>
                    <div className="relative z-10 flex flex-col items-center mt-2 justify-center flex-1">
                         <span className="text-3xl font-black text-pink-500">{weekData.weight}</span>
                         <span className="text-[10px] text-gray-400 mt-1">Média Esperada</span>
                    </div>
                </div>
            </div>

            {/* HEALTH GUIDE CARD (NEW) */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <div className="bg-green-100 p-2 rounded-full text-green-600">
                        <UtensilsIcon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg">Guia de Saúde & Nutrição</h3>
                </div>

                <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                        <h4 className="font-bold text-green-800 text-sm mb-1 flex items-center gap-2">
                            ✅ O que comer (Recomendado)
                        </h4>
                        <p className="text-green-900 text-sm leading-relaxed">{weekData.nutrition}</p>
                    </div>

                    <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                         <h4 className="font-bold text-red-800 text-sm mb-1 flex items-center gap-2">
                            ❌ O que evitar (Atenção)
                        </h4>
                        <p className="text-red-900 text-sm leading-relaxed">{weekData.avoid}</p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3">
                        <StethoscopeIcon className="w-5 h-5 text-blue-500 shrink-0 mt-1" />
                        <div>
                            <h4 className="font-bold text-blue-800 text-sm mb-1">Dica Médica</h4>
                            <p className="text-blue-900 text-sm leading-relaxed">{weekData.healthTip}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* DEVELOPMENT INFO */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <DnaIcon className="w-5 h-5 text-purple-500" />
                    Desenvolvimento Fetal
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                    {weekData.development} {weekData.description}
                </p>
            </div>

            {/* MEDICAL DISCLAIMER */}
            <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl flex gap-3 items-start">
                <AlertIcon className="w-5 h-5 text-yellow-600 shrink-0" />
                <p className="text-[10px] text-yellow-800 leading-tight">
                    <strong>Nota Importante:</strong> O Mamãe Zen fornece estimativas médias de crescimento. Cada bebê é único. 
                    O peso real, a saúde ("se o bebê é normal") e prescrições médicas devem ser avaliadas exclusivamente pelo seu obstetra em consultas presenciais.
                </p>
            </div>

        </div>
    </div>
  );
};

export default PregnancyTracker;