/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SOUND_TRACKS_DB } from '../data/localDatabase';
import { SoundTrack } from '../types';
import { HeadphonesIcon, MusicIcon, PauseIcon, PlayIcon, VolumeIcon, SparklesIcon } from './icons';

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
  const [playerReady, setPlayerReady] = useState(false); // Indicates if YT API is loaded and onYouTubeIframeAPIReady has fired
  const [isPlayerInitializing, setIsPlayerInitializing] = useState(false); // Indicates if YT.Player instance is being created
  const [isTrackLoading, setIsTrackLoading] = useState(false); // Indicates if a track is actively loading/buffering in the player
  
  const playerRef = useRef<any>(null); // Ref to hold the YouTube Player instance
  const ytApiLoadedRef = useRef<boolean>(false); // To prevent loading YouTube API script multiple times

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

  // 1. Load YouTube Iframe API script
  useEffect(() => {
    if (!window.YT && !ytApiLoadedRef.current) {
      ytApiLoadedRef.current = true; // Mark as attempting to load
      setIsPlayerInitializing(true); // Indicate player API is loading

      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setPlayerReady(true);
        setIsPlayerInitializing(false); // API script loaded
      };
    } else if (window.YT && !playerReady) {
      // If script somehow loaded without onYouTubeIframeAPIReady firing (e.g. fast refresh)
      setPlayerReady(true);
      setIsPlayerInitializing(false);
    }
  }, [playerReady]);

  // Callback for player state changes
  const onPlayerStateChange = useCallback((event: any) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      setIsTrackLoading(false);
    } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
      setIsPlaying(false);
      setIsTrackLoading(false);
    } else if (event.data === window.YT.PlayerState.BUFFERING) {
      setIsTrackLoading(true);
    } else {
      setIsTrackLoading(false); // For other states like unstarted, cued
    }
  }, []);

  // Callback for player ready event
  const onPlayerReady = useCallback((event: any) => {
    setIsPlayerInitializing(false); // Player instance is ready
    if (currentTrack && isPlaying) {
      event.target.playVideo();
    }
  }, [currentTrack, isPlaying]);

  // 2. Initialize YouTube Player instance (only once per component lifecycle)
  useEffect(() => {
    if (playerReady && !playerRef.current && !isPlayerInitializing && currentTrack) {
      setIsPlayerInitializing(true); // Mark player instance as being created
      playerRef.current = new window.YT.Player('stealth-player', {
        height: '1',
        width: '1',
        videoId: currentTrack.youtubeId,
        playerVars: {
          'playsinline': 1,
          'controls': 0,
          'disablekb': 1,
          'fs': 0,
          'autoplay': 0, // Do not autoplay on initial player creation
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
    }

    // Cleanup: Destroy player when component unmounts
    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
        playerRef.current = null;
        ytApiLoadedRef.current = false; // Reset for potential re-mounts
        setPlayerReady(false);
      }
    };
  }, [playerReady, isPlayerInitializing, currentTrack, onPlayerReady, onPlayerStateChange]); // currentTrack included to ensure player is created if currentTrack is set before playerReady

  // 3. Load/Play video when currentTrack changes or play state changes
  useEffect(() => {
    if (playerRef.current && currentTrack) {
      if (typeof playerRef.current.loadVideoById === 'function') {
        // Only load a new video if the track actually changed
        if (playerRef.current.getVideoData().video_id !== currentTrack.youtubeId) {
          setIsTrackLoading(true);
          playerRef.current.loadVideoById(currentTrack.youtubeId);
        }
        
        // Control play/pause
        if (isPlaying) {
          playerRef.current.playVideo();
        } else {
          playerRef.current.pauseVideo();
        }
      }
    }
  }, [currentTrack, isPlaying]); // Depend on currentTrack and isPlaying

  const handleTrackClick = (track: SoundTrack) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying); // Toggle play/pause for the same track
    } else {
      // If a new track is selected, set it and start playing
      setCurrentTrack(track);
      setIsPlaying(true);
      setIsTrackLoading(true); // Indicate new track is loading
    }
  };

  const getPlayerStatusMessage = () => {
    if (isPlayerInitializing) return 'Carregando Player YouTube...';
    if (!playerReady) return 'Aguardando API do YouTube...';
    if (isTrackLoading && currentTrack) return `Carregando "${currentTrack.title}"...`;
    return '';
  };

  return (
    <div className="flex flex-col h-full bg-[#fff5f7] min-h-[calc(100vh-theme(spacing.20))]"> {/* Adjusted min-h for better space filling */}
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
        
        {/* Player Loading Indicator */}
        {(isPlayerInitializing || isTrackLoading) && (
            <div className="flex items-center gap-2 mt-2 text-primary text-xs font-medium animate-pulse">
                <SparklesIcon className="w-4 h-4 animate-spin" />
                <span>{getPlayerStatusMessage()}</span>
            </div>
        )}

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
      <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 gap-4 pb-24"> {/* Adjusted pb for navigation bar */}
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
                  {isPlaying && !isTrackLoading ? <VolumeIcon className="w-3 h-3 text-green-400" /> : null}
                  <span>{isTrackLoading ? 'Carregando...' : (isPlaying ? 'Reproduzindo...' : 'Pausado')}</span>
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