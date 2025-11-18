
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { AppView } from '../types';
import { BabyIcon, HomeIcon, MapPinIcon, StethoscopeIcon, UtensilsIcon, MusicIcon } from './icons';

interface NavigationProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: AppView.DASHBOARD, icon: <HomeIcon className="w-6 h-6" />, label: 'Início' },
    { id: AppView.CRY_ANALYZER, icon: <BabyIcon className="w-6 h-6" />, label: 'Choro' },
    { id: AppView.CONSULTANT, icon: <StethoscopeIcon className="w-6 h-6" />, label: 'Ajuda' },
    { id: AppView.SOUNDS, icon: <MusicIcon className="w-6 h-6" />, label: 'Sons' },
    { id: AppView.MAPS, icon: <MapPinIcon className="w-6 h-6" />, label: 'Mapa' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-pink-100 pb-safe pt-2 px-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-around items-center max-w-md mx-auto pb-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex flex-col items-center p-2 rounded-xl transition-colors min-w-[60px] ${
              currentView === item.id
                ? 'text-primary bg-pink-50'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-medium mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
