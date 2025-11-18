
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import ApiKeyDialog from './components/ApiKeyDialog';
import Navigation from './components/Navigation';
import CryAnalyzer from './components/CryAnalyzer';
import SpecialistChat from './components/SpecialistChat';
import RecipeFinder from './components/RecipeFinder';
import MapFinder from './components/MapFinder';
import SoundTherapy from './components/SoundTherapy';
import PregnancyTracker from './components/PregnancyTracker';
import { AppView, SpecialistType } from './types';
import { 
  SparklesIcon, 
  MicIcon, 
  MapPinIcon, 
  StethoscopeIcon, 
  BrainIcon, 
  AppleIcon, 
  ChevronRightIcon,
  MusicIcon,
  BabyIcon,
  DnaIcon
} from './components/icons';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [selectedSpecialist, setSelectedSpecialist] = useState<SpecialistType | null>(null);
  const [userName] = useState("Mamãe");

  // Check API Key
  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio) {
        try {
          if (!(await window.aistudio.hasSelectedApiKey())) {
            setShowApiKeyDialog(true);
          }
        } catch (error) {
          setShowApiKeyDialog(true);
        }
      }
    };
    checkApiKey();
  }, []);

  const handleApiKeyContinue = async () => {
    setShowApiKeyDialog(false);
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
    }
  };

  const handleSpecialistClick = (type: SpecialistType) => {
    setSelectedSpecialist(type);
    setCurrentView(AppView.CONSULTANT);
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.CRY_ANALYZER:
        return <CryAnalyzer />;
      case AppView.CONSULTANT:
        return (
          <SpecialistChat 
            onBack={() => {
              setCurrentView(AppView.DASHBOARD);
              setSelectedSpecialist(null);
            }} 
            initialSpecialist={selectedSpecialist} 
          />
        );
      case AppView.RECIPES:
        return <RecipeFinder />;
      case AppView.MAPS:
        return <MapFinder />;
      case AppView.SOUNDS:
        return <SoundTherapy />;
      case AppView.PREGNANCY:
        return <PregnancyTracker onBack={() => setCurrentView(AppView.DASHBOARD)} />;
      case AppView.DASHBOARD:
      default:
        return (
          <div className="p-6 space-y-6 pb-24 animate-fade-in">
            {/* Welcome Header */}
            <div className="mt-2">
              <h1 className="text-2xl font-bold text-gray-800">Olá, {userName} <span className="text-primary">♥</span></h1>
              <p className="text-gray-500 text-sm">Como podemos ajudar hoje?</p>
            </div>

            {/* PREGNANCY TRACKER BUTTON (NEW) */}
            <button 
              onClick={() => setCurrentView(AppView.PREGNANCY)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl p-1 shadow-lg shadow-purple-200 transform transition hover:scale-[1.02]"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-[20px] p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-full text-white animate-pulse-slow">
                    <DnaIcon className="w-6 h-6" />
                  </div>
                  <div className="text-left text-white">
                    <h3 className="font-bold text-lg">Bebê 3D Realista</h3>
                    <p className="text-xs opacity-90">Acompanhe a evolução semanal</p>
                  </div>
                </div>
                <ChevronRightIcon className="w-6 h-6 text-white/80" />
              </div>
            </button>

            {/* NEW MAIN CARD: Specialist Hub */}
            <div className="bg-white rounded-3xl p-5 shadow-xl shadow-purple-100/50 border border-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-10 -mt-10 opacity-50"></div>
              
              <div className="relative z-10 mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-purple-500" />
                  Especialistas IA
                </h2>
                <p className="text-xs text-gray-500 mt-1">Suporte profissional instantâneo 24h</p>
              </div>

              <div className="space-y-3 relative z-10">
                  {/* Pediatrician */}
                  <button 
                    onClick={() => handleSpecialistClick(SpecialistType.PEDIATRICIAN)}
                    className="w-full flex items-center gap-4 p-3 rounded-xl bg-blue-50/50 border border-blue-100 hover:bg-blue-50 transition-colors group"
                  >
                    <div className="bg-blue-100 p-2.5 rounded-full text-blue-600 group-hover:scale-110 transition-transform">
                      <StethoscopeIcon className="w-5 h-5" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="font-bold text-gray-700 text-sm">Pediatra</h3>
                      <p className="text-[10px] text-gray-500">Sintomas e saúde</p>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-blue-300" />
                  </button>

                  {/* Psychologist */}
                  <button 
                    onClick={() => handleSpecialistClick(SpecialistType.PSYCHOLOGIST)}
                    className="w-full flex items-center gap-4 p-3 rounded-xl bg-purple-50/50 border border-purple-100 hover:bg-purple-50 transition-colors group"
                  >
                    <div className="bg-purple-100 p-2.5 rounded-full text-purple-600 group-hover:scale-110 transition-transform">
                      <BrainIcon className="w-5 h-5" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="font-bold text-gray-700 text-sm">Psicóloga</h3>
                      <p className="text-[10px] text-gray-500">Apoio emocional</p>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-purple-300" />
                  </button>

                  {/* Nutritionist */}
                  <button 
                    onClick={() => handleSpecialistClick(SpecialistType.NUTRITIONIST)}
                    className="w-full flex items-center gap-4 p-3 rounded-xl bg-green-50/50 border border-green-100 hover:bg-green-50 transition-colors group"
                  >
                    <div className="bg-green-100 p-2.5 rounded-full text-green-600 group-hover:scale-110 transition-transform">
                      <AppleIcon className="w-5 h-5" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="font-bold text-gray-700 text-sm">Nutricionista</h3>
                      <p className="text-[10px] text-gray-500">Alimentação</p>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-green-300" />
                  </button>
              </div>
            </div>

            {/* Secondary Actions Grid */}
            <div className="grid grid-cols-2 gap-4">
                {/* Cry Analyzer */}
                <button 
                  onClick={() => setCurrentView(AppView.CRY_ANALYZER)}
                  className="bg-gradient-to-br from-pink-400 to-rose-400 p-4 rounded-2xl text-white shadow-lg shadow-pink-200 hover:shadow-pink-300 transition-shadow flex flex-col justify-between h-32 relative overflow-hidden"
                >
                  <div className="absolute right-0 top-0 p-3 opacity-20">
                      <MicIcon className="w-16 h-16" />
                  </div>
                  <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <MicIcon className="w-4 h-4" />
                  </div>
                  <div>
                      <h3 className="font-bold text-lg leading-tight text-left">Tradutor<br/>de Choro</h3>
                      <p className="text-[10px] opacity-90 mt-1 text-left">Identificar motivo</p>
                  </div>
                </button>

                {/* Sounds */}
                <button 
                  onClick={() => setCurrentView(AppView.SOUNDS)}
                  className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-32 group"
                >
                  <div className="bg-yellow-100 w-8 h-8 rounded-full flex items-center justify-center text-yellow-600 group-hover:scale-110 transition-transform">
                      <MusicIcon className="w-4 h-4" />
                  </div>
                  <div>
                      <h3 className="font-bold text-gray-700 text-lg leading-tight text-left">Sons<br/>de Ninar</h3>
                      <p className="text-[10px] text-gray-400 mt-1 text-left">Ruído branco e mais</p>
                  </div>
                </button>

                {/* Maps */}
                <button 
                  onClick={() => setCurrentView(AppView.MAPS)}
                  className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-32 col-span-2"
                >
                  <div className="flex justify-between items-start">
                    <div className="bg-indigo-50 w-8 h-8 rounded-full flex items-center justify-center text-indigo-500">
                        <MapPinIcon className="w-4 h-4" />
                    </div>
                    <div className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full">
                      GPS
                    </div>
                  </div>
                  <div>
                      <h3 className="font-bold text-gray-700 text-lg leading-tight text-left">Locais Úteis & Emergência</h3>
                      <p className="text-[10px] text-gray-400 mt-1 text-left">Encontre farmácias e hospitais próximos</p>
                  </div>
                </button>
            </div>

            {/* Tip Card */}
            <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 flex gap-4 items-start">
              <div className="bg-orange-100 p-2 rounded-full text-orange-500 shrink-0">
                  <SparklesIcon className="w-4 h-4" />
              </div>
              <div>
                  <h4 className="font-bold text-orange-800 text-xs uppercase mb-1">Dica Mamãe Zen</h4>
                  <p className="text-orange-900 text-sm leading-snug">
                      "Tire 5 minutos para você hoje. Uma mãe descansada cuida ainda melhor."
                  </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#fff0f3] font-sans overflow-x-hidden">
      {showApiKeyDialog && (
        <ApiKeyDialog onContinue={handleApiKeyContinue} />
      )}
      
      <main className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative">
        {renderContent()}
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
      </main>
    </div>
  );
};

export default App;
