
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect } from 'react';
import { SOUND_TRACKS_DB } from '../data/localDatabase';
import { SoundTrack } from '../types';
import { HeadphonesIcon, MusicIcon, PauseIcon, PlayIcon, VolumeIcon, AlertIcon } from './icons';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

const SoundTherapy: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'baby' | 'nature' | 'womb' | 'mom'>('all');
  const [currentTrack, setCurrentTrack] = useState<SoundTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  
  const playerRef = useRef<any>(null);

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'womb', label: 'Útero' },
    { id: 'baby', label: 'Bebê' },
    { id: 'nature', label: 'Natureza' },
    { id: 'mom', label: 'Mamãe' },
  ];

  const filteredTracks = activeCategory === 'all' 
    ? SOUND_TRACKS_DB 
    : SOUND_TRACKS_DB.filter(t => t.category === activeCategory);

  // Load YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setPlayerReady(true);
      };
    } else {
      setPlayerReady(true);
    }
  }, []);

  // Initialize Player when track selected
  useEffect(() => {
    if (currentTrack && playerReady) {
      // If player exists, just load new video
      if (playerRef.current) {
        playerRef.current.loadVideoById(currentTrack.youtubeId);
        if (isPlaying) {
             playerRef.current.playVideo();
        }
      } else {
        // Create new player
        playerRef.current = new window.YT.Player('stealth-player', {
          height: '1',
          width: '1', // Stealth Mode
          videoId: currentTrack.youtubeId,
          playerVars: {
            'playsinline': 1,
            'controls': 0,
            'disablekb': 1,
            'fs': 0
          },
          events: {
            'onReady': (event: any) => {
                if (isPlaying) event.target.playVideo();
            },
            'onStateChange': (event: any) => {
                if (event.data === window.YT.PlayerState.PLAYING) setIsPlaying(true);
                if (event.data === window.YT.PlayerState.PAUSED) setIsPlaying(false);
            }
          }
        });
      }
    }
  }, [currentTrack, playerReady]);

  // Toggle Play/Pause
  useEffect(() => {
    if (playerRef.current && playerRef.current.playVideo) {
        if (isPlaying) {
            playerRef.current.playVideo();
        } else {
            playerRef.current.pauseVideo();
        }
    }
  }, [isPlaying]);

  const handleTrackClick = (track: SoundTrack) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setIsPlaying(true);
      setCurrentTrack(track);
    }
  };

  return (
    <div className="flex flex-col h-full pb-32 bg-[#fff5f7]">
      {/* Stealth Player Container - Hidden Visually but present in DOM */}
      <div className="absolute top-0 left-0 w-[1px] h-[1px] overflow-hidden opacity-0 pointer-events-none">
        <div id="stealth-player"></div>
      </div>

      {/* Header */}
      <div className="px-6 py-6 bg-white rounded-b-3xl shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <HeadphonesIcon className="w-6 h-6 text-primary" />
          Sons de Ninar
        </h2>
        <p className="text-gray-500 text-sm mt-1">Relaxamento Profundo via Streaming</p>
        
        {/* Categories */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-primary text-white shadow-md shadow-pink-200'
                  : 'bg-white border border-pink-100 text-gray-500 hover:bg-pink-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Track Grid */}
      <div className="p-4 overflow-y-auto grid grid-cols-2 gap-4 pb-32">
        {filteredTracks.map(track => (
          <button
            key={track.id}
            onClick={() => handleTrackClick(track)}
            className={`relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 ${
              currentTrack?.id === track.id && isPlaying
                ? 'ring-4 ring-pink-200 scale-[0.98] bg-white' 
                : 'hover:shadow-md hover:-translate-y-1'
            } ${track.color}`}
          >
            {/* Visualizer Effect (Simulated) */}
            {currentTrack?.id === track.id && isPlaying && (
              <div className="absolute right-2 bottom-2 flex gap-0.5 items-end h-4 opacity-50">
                <div className="w-1 bg-gray-800 animate-[bounce_0.5s_infinite] h-2"></div>
                <div className="w-1 bg-gray-800 animate-[bounce_0.7s_infinite] h-4"></div>
                <div className="w-1 bg-gray-800 animate-[bounce_0.6s_infinite] h-3"></div>
              </div>
            )}

            <div className="bg-white/80 w-10 h-10 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm shadow-sm">
              {currentTrack?.id === track.id && isPlaying ? (
                <PauseIcon className="w-5 h-5 text-gray-800" />
              ) : (
                <PlayIcon className="w-5 h-5 text-gray-800 ml-1" />
              )}
            </div>
            
            <h3 className="font-bold text-gray-800 text-sm leading-tight">{track.title}</h3>
            <span className="text-[10px] font-medium text-gray-500 mt-1 block opacity-70 uppercase tracking-wide">
              {track.duration}
            </span>
          </button>
        ))}
      </div>

      {/* Player Bar */}
      {currentTrack && (
        <div className="fixed bottom-20 left-4 right-4 bg-gray-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl z-40 animate-slide-up flex items-center justify-between border border-white/10">
          
          {/* Info */}
          <div className="flex items-center gap-3 flex-1 overflow-hidden">
            <div className={`w-10 h-10 rounded-full ${currentTrack.color} flex items-center justify-center shrink-0 ${isPlaying ? 'animate-[spin_8s_linear_infinite]' : ''}`}>
              <MusicIcon className="w-5 h-5 text-gray-800" />
            </div>
            <div className="flex flex-col overflow-hidden">
               <h4 className="font-bold text-sm truncate">{currentTrack.title}</h4>
               <div className="flex items-center gap-1 text-[10px] text-gray-300">
                  {isPlaying ? <VolumeIcon className="w-3 h-3 text-green-400" /> : null}
                  <span>{isPlaying ? 'Reproduzindo...' : 'Pausado'}</span>
               </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 pl-4">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-900 hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            >
              {isPlaying ? <PauseIcon className="w-5 h-5" fill="currentColor" /> : <PlayIcon className="w-5 h-5 ml-1" fill="currentColor" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoundTherapy;
