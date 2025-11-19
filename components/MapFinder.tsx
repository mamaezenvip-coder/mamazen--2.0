/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { findNearbyPlaces } from '../services/geminiService';
import { MapPlace } from '../types';
import { COMFORT_PHRASES_DB, PLACES_DB } from '../data/localDatabase';
import { MapPinIcon, SearchIcon, AlertIcon, ArrowLeftIcon, ArrowRightIcon, HeartIcon, SparklesIcon, MaximizeIcon } from './icons';

// Localização padrão para São Paulo, usada como fallback ou inicial.
const DEFAULT_LOCATION = { lat: -23.5505, lng: -46.6333 }; 

const MapFinder: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'navigation'>('list');
  const [isStartingNav, setIsStartingNav] = useState(false);
  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState<MapPlace[]>([]);
  const [loading, setLoading] = useState(false);
  // `location` agora é inicializado com DEFAULT_LOCATION e nunca é null.
  const [location, setLocation] = useState<{lat: number, lng: number}>(DEFAULT_LOCATION); 
  const [locationError, setLocationError] = useState<string | null>(null); // Mensagem de erro para o usuário
  const [selectedRoute, setSelectedRoute] = useState<MapPlace | null>(null);
  const [supportMessage, setSupportMessage] = useState("");
  
  // Refs to handle audio stability and watchPosition ID
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const navIntervalRef = useRef<number | null>(null);
  const watchIdRef = useRef<number | null>(null); // To store watchPosition ID
  const mapIframeRef = useRef<HTMLIFrameElement>(null); // Ref for map iframe

  // 1. Carga Inicial do GPS e Verificação de Permissão (getCurrentPosition uma vez ao montar)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // Em sucesso, atualiza para a localização real
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationError(null); // Limpa quaisquer erros anteriores
        },
        (err) => {
          console.warn('Initial geolocation error:', err);
          if (err.code === err.PERMISSION_DENIED) {
            setLocationError('Permissão de localização negada. Habilite o GPS nas configurações do seu navegador/dispositivo para usar todos os recursos.');
          } else {
            setLocationError('Não foi possível obter a localização atual. Verifique o GPS. Usando localização padrão (São Paulo).');
          }
          // Se houver erro, `location` permanece DEFAULT_LOCATION do estado inicial.
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationError('Geolocalização não suportada neste navegador. Usando localização padrão (São Paulo).');
      // Se não suportado, `location` permanece DEFAULT_LOCATION.
    }

    // Limpeza para síntese de fala e intervalos ao desmontar
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (navIntervalRef.current) {
        clearInterval(navIntervalRef.current);
      }
      // watchPosition é gerenciado em seu próprio useEffect, então não precisa de clearWatch aqui.
    };
  }, []); // Executa apenas uma vez na montagem para localização inicial

  // 2. Rastreamento Contínuo (watchPosition) baseado no viewMode e status de permissão
  useEffect(() => {
    const isPermissionDenied = locationError?.includes('Permissão de localização negada');
    // watchPosition deve estar ativo se estivermos em navegação E a permissão NÃO foi negada.
    const shouldWatch = viewMode === 'navigation' && !isPermissionDenied;

    if (shouldWatch && watchIdRef.current === null) { 
      // Inicia watch se as condições forem atendidas e não estiver assistindo
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationError(null); // Limpa erros se o sinal retornar
        },
        (err) => {
          console.warn('Watch position error:', err);
          // Apenas atualiza a mensagem de erro, NÃO altera a localização.
          // O mapa deve continuar exibindo a última posição conhecida.
          // Só atualiza o erro se não for uma permissão negada persistente.
          if (!locationError?.includes('Permissão de localização negada')) {
            setLocationError('Sinal GPS perdido durante a navegação. A rota pode não ser atualizada em tempo real.');
          }
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else if (!shouldWatch && watchIdRef.current !== null) {
      // Limpa watch se as condições não forem atendidas e estiver assistindo
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    // Limpeza para este efeito específico
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [viewMode, locationError]); // Re-executa efeito quando viewMode ou locationError (para permissão negada) muda

  // Helper para falar texto de forma confiável
  const speak = (text: string, rate = 1.0) => {
    if (!window.speechSynthesis) return;
    
    // Cancela qualquer fala atual para evitar acúmulo na fila em cliques rápidos
    window.speechSynthesis.cancel(); 

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = 'pt-BR';
    speech.rate = rate;
    speech.pitch = 1.1; 
    
    utteranceRef.current = speech;
    window.speechSynthesis.speak(speech);
  };

  // Loop de Voz de Suporte Contínuo usando DATABASE
  useEffect(() => {
    if (viewMode === 'navigation') {
      if (navIntervalRef.current) clearInterval(navIntervalRef.current);

      // Inicia loop
      navIntervalRef.current = setInterval(() => {
        const phrase = COMFORT_PHRASES_DB[Math.floor(Math.random() * COMFORT_PHRASES_DB.length)];
        setSupportMessage(phrase);
        speak(phrase);

        setTimeout(() => setSupportMessage(""), 8000); // Limpa a mensagem após ~8 segundos
      }, 30000); // Fala a cada 30 segundos
    } else {
      if (navIntervalRef.current) {
        clearInterval(navIntervalRef.current);
        navIntervalRef.current = null;
      }
      // Cancela a fala ao sair da navegação
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }

    return () => {
      if (navIntervalRef.current) clearInterval(navIntervalRef.current);
    };
  }, [viewMode]);

  const handleSearch = async (searchQuery: string, customLocation?: {lat: number, lng: number}): Promise<MapPlace[]> => {
    // Usa customLocation se fornecido, caso contrário, a localização atual, que sempre terá um valor (real ou padrão)
    const loc = customLocation || location; 
    if (!searchQuery.trim()) {
      setPlaces([]); // Limpa os locais se a consulta estiver vazia
      return [];
    }

    setLoading(true);
    setQuery(searchQuery); 
    try {
      const results = await findNearbyPlaces(searchQuery, loc.lat, loc.lng);
      setPlaces(results);
      return results;
    } catch (error) {
      console.error("Search error:", error);
      setPlaces(PLACES_DB); // Ultra fallback para pesquisa
      return PLACES_DB;
    } finally {
      setLoading(false);
    }
  };

  // Função para iniciar a navegação, agora incluindo o carregamento empático e a fala
  const startNavigation = (place: MapPlace) => {
    const isPermissionDenied = locationError?.includes('Permissão de localização negada');

    if (isPermissionDenied) {
      alert(locationError || 'Permissão de localização negada. Ative o GPS para navegar.');
      return;
    }
    // Se a localização atual for a padrão (São Paulo), e não houver um erro específico de sinal perdido,
    // significa que não conseguimos sua localização real.
    if (location.lat === DEFAULT_LOCATION.lat && location.lng === DEFAULT_LOCATION.lng && 
        !locationError?.includes('Sinal GPS perdido')) {
      alert('Não foi possível obter sua localização atual. A navegação pode usar um ponto de partida aproximado (São Paulo). Por favor, ative o GPS.');
      // Continua com a navegação usando a localização padrão, que getMapUrl irá gerenciar
    }
    
    setSelectedRoute(place);
    setIsStartingNav(true); // Aciona o carregamento empático

    window.speechSynthesis.cancel(); 
    
    setTimeout(() => {
        speak("Calma pais, seu bebê vai ficar bem. Deixe comigo que vou traçar a rota mais próxima com segurança. Apertem os cintos e vamos lá.", 0.9);
    }, 300);

    setTimeout(() => {
      setIsStartingNav(false);
      setViewMode('navigation');
    }, 6000); // Espera a fala terminar aproximadamente
  };

  // Lida com a ação de navegação rápida do botão de entrada de pesquisa
  const handleQuickNavigate = async () => {
    if (!query.trim()) {
      alert('Por favor, digite algo para buscar.');
      return;
    }
    
    const isPermissionDenied = locationError?.includes('Permissão de localização negada');
    if (isPermissionDenied) {
      alert(locationError || 'Permissão de localização negada. Ative o GPS para buscar e navegar.');
      return;
    }

    setLoading(true);
    // Passa a localização atual para handleSearch para resultados mais precisos
    const results = await handleSearch(query, location); // Passa a melhor localização disponível
    
    if (results.length > 0) {
      startNavigation(results[0]); // Navega automaticamente para o primeiro (mais próximo) resultado
    } else {
      setLoading(false); // Se não houver resultados, para o carregamento
      alert('Nenhum local encontrado para a sua busca.');
    }
  };

  const exitNavigation = () => {
    window.speechSynthesis.cancel();
    if (navIntervalRef.current) clearInterval(navIntervalRef.current);
    setViewMode('list');
    setSelectedRoute(null);
    setIsStartingNav(false);
    // NÃO limpa locationError aqui, ele deve persistir até que o GPS se recupere ou o usuário altere as configurações
  };

  const toggleFullscreen = () => {
    if (mapIframeRef.current) {
      if (mapIframeRef.current.requestFullscreen) {
        mapIframeRef.current.requestFullscreen();
      } else if ((mapIframeRef.current as any).mozRequestFullScreen) { /* Firefox */
        (mapIframeRef.current as any).mozRequestFullScreen();
      } else if ((mapIframeRef.current as any).webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        (mapIframeRef.current as any).webkitRequestFullscreen();
      } else if ((mapIframeRef.current as any).msRequestFullscreen) { /* IE/Edge */
        (mapIframeRef.current as any).msRequestFullscreen();
      }
    }
  };

  const categories = [
    { name: 'Hospitais', icon: '🏥' },
    { name: 'Farmácia 24h', icon: '💊' },
    { name: 'Pediatra', icon: '🩺' },
    { name: 'Parques', icon: '🌳' }
  ];

  // Constrói a URL do Mapa com segurança com saddr e daddr para traçar a rota
  const getMapUrl = (currentLocation: {lat: number, lng: number}, destinationPlace: MapPlace | null) => {
    // currentLocation agora é garantido que não é null
    const originLat = currentLocation.lat; 
    const originLng = currentLocation.lng;

    const destLat = destinationPlace?.lat ?? DEFAULT_LOCATION.lat; 
    const destLng = destinationPlace?.lng ?? DEFAULT_LOCATION.lng + 0.01; // Usando um fallback ligeiramente diferente para o destino para visibilidade

    // Usa saddr e daddr para forçar o rastreamento da rota
    return `https://maps.google.com/maps?saddr=${originLat},${originLng}&daddr=${destLat},${destLng}&t=m&z=17&output=embed`;
  };

  // --- TELA DE CARREGAMENTO EMPÁTICA ---
  if (isStartingNav) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-pink-50 to-white flex flex-col items-center justify-center p-8 text-center animate-fade-in">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-pink-200 rounded-full animate-ping opacity-50"></div>
          <div className="bg-white p-6 rounded-full shadow-xl relative z-10">
            <HeartIcon className="w-20 h-20 text-primary animate-pulse" fill="currentColor" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-800 mb-4 leading-tight">
          Calma pais, <br/>seu bebê vai ficar bem.
        </h2>
        
        <p className="text-lg text-gray-600 mb-8 font-medium leading-relaxed max-w-xs mx-auto">
          Deixe comigo que vou traçar a rota mais próxima com segurança.
        </p>

        <div className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-pink-300/50 animate-bounce">
          Iniciando Satélite MamãeZen...
        </div>
      </div>
    );
  }

  // --- VISUALIZAÇÃO DE NAVEGAÇÃO (GPS 4D Premium) ---
  if (viewMode === 'navigation' && selectedRoute) {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col h-full w-full animate-fade-in overflow-hidden">
        
        {/* Support Message Overlay */}
        {supportMessage && (
          <div className="absolute top-28 left-4 right-4 z-30 animate-fade-in-down pointer-events-none">
            <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border-l-4 border-primary flex items-center gap-3">
               <SparklesIcon className="w-6 h-6 text-primary animate-spin-slow" />
               <p className="text-gray-800 font-medium text-sm">{supportMessage}</p>
            </div>
          </div>
        )}

        {/* Header / Status Bar */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 pt-8 pb-6 rounded-b-[2rem] shadow-2xl z-20 relative"> {/* Increased padding */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={exitNavigation} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm">
                    <ArrowLeftIcon className="w-6 h-6 text-white" />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Satélite Mamãe Zen</span>
                    {/* Status de GPS na navegação */}
                    <span className="text-sm font-bold flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full mt-1 border border-white/20 backdrop-blur-md">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${locationError ? (locationError.includes('Permissão de localização negada') ? 'bg-red-400' : 'bg-yellow-400') : 'bg-green-400'} shadow-[0_0_10px_#4ade80]`}></div>
                        {locationError ? (locationError.includes('Permissão de localização negada') ? 'GPS Desativado' : 'Sinal Instável') : 'GPS Ativo'}
                    </span>
                    {locationError && <p className="text-red-300 text-[10px] mt-1 text-center">{locationError.includes('Permissão de localização negada') ? 'Habilite o GPS para rota em tempo real.' : locationError}</p>}
                </div>
                {/* Fullscreen Button (Re-added) */}
                <button 
                  onClick={toggleFullscreen} 
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm"
                  aria-label="Expandir mapa em tela cheia"
                >
                  <MaximizeIcon className="w-6 h-6 text-white" />
                </button>
            </div>

            {/* Direction Card */}
            <div className="bg-white/10 backdrop-blur-md text-white rounded-2xl p-4 flex items-center gap-4 border border-white/20">
                <div className="bg-white/20 p-3 rounded-xl">
                    <ArrowRightIcon className="w-8 h-8 text-white" />
                </div>
                <div className="overflow-hidden">
                    <h3 className="font-bold text-xl truncate">Siga para o destino</h3>
                    <p className="text-pink-100 text-sm font-medium opacity-90 truncate">{selectedRoute.name}</p>
                </div>
            </div>
        </div>

        {/* Map Area (Simulated 3D Perspective) */}
        <div className="flex-1 relative bg-gray-800 -mt-8 z-10 perspective-container">
            {/* Perspective Wrapper */}
            <div 
                className="w-full h-[120%] origin-top transform-gpu"
                style={{ 
                    transformStyle: 'preserve-3d' 
                }}
            >
                <iframe
                    ref={mapIframeRef} // Attach ref here
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    // Night mode filter applied here
                    style={{ border: 0, filter: 'invert(0.9) hue-rotate(180deg) brightness(0.9) contrast(1.1) saturate(1.1)' }}
                    src={getMapUrl(location, selectedRoute)} // Pass current location and selected route
                    allowFullScreen
                    title="GPS Navigation"
                    className="w-full h-full"
                ></iframe>
            </div>
            
            {/* Floating Premium HUD */}
            <div className="absolute bottom-8 left-4 right-4 pointer-events-none">
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] p-6 flex justify-between items-center border border-white/50 mb-4 pointer-events-auto"> {/* Increased padding for more space */}
                    <div className="flex flex-col items-center px-2 border-r border-gray-200 flex-1">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Tempo Est.</span>
                        <span className="text-2xl font-bold text-primary">12<span className="text-sm text-gray-500 ml-0.5">min</span></span>
                    </div>
                    <div className="flex flex-col items-center px-2 border-r border-gray-200 flex-1">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Distância</span>
                        <span className="text-2xl font-bold text-gray-700">{selectedRoute.distance ? selectedRoute.distance.replace('km','') : '2.5'}<span className="text-sm text-gray-500 ml-0.5">km</span></span>
                    </div>
                    <div className="flex flex-col items-center px-2 flex-1">
                         <span className="text-[10px] text-gray-400 font-bold uppercase">Status</span>
                         <span className="text-lg font-bold text-green-600">Fluindo</span>
                    </div>
                </div>
                
                <div className="flex gap-3 pointer-events-auto">
                    <button 
                        onClick={exitNavigation}
                        className="flex-1 bg-white text-gray-700 font-bold py-4 rounded-2xl shadow-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                        ENCERRAR
                    </button>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="p-0 h-full flex flex-col bg-gray-50 pb-20"> {/* Adjusted p-0, pb-20 for nav bar */}
      {/* Premium Header */}
      <div className="bg-white p-6 pb-4 rounded-b-3xl shadow-sm border-b border-pink-50">
        <div className="flex items-center justify-between mb-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <MapPinIcon className="w-6 h-6 text-primary" />
                    GPS Materno
                </h2>
                <p className="text-xs text-gray-500 mt-1">Localize o que seu bebê precisa</p>
            </div>
            {/* Indicador de Status do GPS: ATIVO se location não for DEFAULT_LOCATION e não houver erro de permissão */}
            <div className={`flex items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-full border ${location.lat !== DEFAULT_LOCATION.lat && !locationError?.includes('Permissão de localização negada') ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${location.lat !== DEFAULT_LOCATION.lat && !locationError?.includes('Permissão de localização negada') ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                {location.lat !== DEFAULT_LOCATION.lat && !locationError?.includes('Permissão de localização negada') ? 'GPS ATIVO' : 'MODO OFFLINE'}
            </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
            <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar hospital, farmácia..." 
                className="w-full bg-gray-100 border-none shadow-md rounded-2xl py-3 pl-12 pr-12 focus:ring-2 focus:ring-primary/50 outline-none text-gray-700 placeholder-gray-400 shadow-inner transition-all"
            />
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <button 
                onClick={handleQuickNavigate} // Chamada para handleQuickNavigate
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-pink-400 p-1.5 rounded-lg text-white transition-colors shadow-md"
                aria-label="Buscar e Iniciar Navegação"
            >
                <ArrowRightIcon className="w-4 h-4" />
            </button>
        </div>

        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
            {categories.map(cat => (
                <button 
                    key={cat.name}
                    onClick={() => handleSearch(cat.name)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm whitespace-nowrap hover:border-primary hover:bg-pink-50 hover:text-primary transition-all active:scale-95"
                >
                    <span className="text-lg">{cat.icon}</span>
                    <span className="text-sm font-bold text-gray-600">{cat.name}</span>
                </button>
            ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Mostra erro de permissão negada (permanente) */}
        {locationError?.includes('Permissão de localização negada') && ( 
          <div className="flex flex-col items-center justify-center h-64 opacity-80 text-center space-y-3 p-4 bg-red-50 border border-red-100 rounded-xl mb-4">
              <div className="bg-red-100 p-4 rounded-full">
                   <AlertIcon className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-sm text-red-700 font-medium leading-relaxed">{locationError} <br/>Recursos de localização desativados.</p>
          </div>
        )}
         {/* Mostra erros temporários de localização (ex: sinal perdido, mas não permissão negada) */}
         {locationError && !locationError.includes('Permissão de localização negada') && (
            <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-xl flex items-start gap-3 mb-4">
                <AlertIcon className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-800 leading-tight">
                    {locationError} Os resultados ainda usam sua última localização conhecida ou padrão.
                </p>
            </div>
         )}


        {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-pink-200 rounded-full animate-ping opacity-75"></div>
                    <div className="relative bg-white p-4 rounded-full shadow-lg">
                        <MapPinIcon className="w-8 h-8 text-primary animate-bounce" />
                    </div>
                </div>
                <p className="text-gray-500 font-medium">Buscando via Satélite...</p>
            </div>
        ) : places.length > 0 ? (
            <div className="space-y-4 pb-8">
                <div className="flex items-center justify-between px-1">
                    <h3 className="font-bold text-gray-800">Resultados Encontrados</h3>
                    <span className="text-xs text-gray-400">{places.length} locais</span>
                </div>
                {places.map((place, index) => (
                    <div key={index} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <div className="pr-8">
                                <h4 className="font-bold text-lg text-gray-800 leading-tight">{place.name}</h4>
                                <p className="text-sm text-gray-500 mt-1">{place.address}</p>
                            </div>
                            <div className="bg-primary/10 text-primary font-bold px-2 py-1 rounded-lg text-xs whitespace-nowrap">
                                {place.rating} ★
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 mb-5">
                            <span className="text-xs font-medium text-gray-400 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                                📍 {place.distance || 'Perto'}
                            </span>
                            {place.isOpen && (
                                <span className="text-xs font-medium text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-md">
                                    ● Aberto Agora
                                </span>
                            )}
                        </div>

                        <button 
                            onClick={() => startNavigation(place)}
                            className="w-full bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-red-200/50 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
                        >
                            <AlertIcon className="w-5 h-5" />
                            INICIAR ROTA SEGURA
                        </button>
                    </div>
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center h-64 opacity-50 text-center space-y-3">
                <div className="bg-gray-100 p-4 rounded-full">
                     <MapPinIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">Busque para encontrar locais úteis.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default MapFinder;