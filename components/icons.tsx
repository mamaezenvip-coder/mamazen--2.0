/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import {
  Mic,
  Stethoscope,
  Utensils,
  MapPin,
  Users,
  Heart,
  Home,
  Brain,
  Apple,
  Baby,
  Play,
  Square,
  ChevronRight,
  Search,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Key,
  ArrowRight,
  ChevronDown,
  Music,
  Headphones,
  Pause,
  Volume2,
  Dna,
  Maximize2
} from 'lucide-react';

const defaultProps = {
  strokeWidth: 2,
};

export const MicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Mic {...defaultProps} {...props} />;
export const StethoscopeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Stethoscope {...defaultProps} {...props} />;
export const UtensilsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Utensils {...defaultProps} {...props} />;
export const MapPinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <MapPin {...defaultProps} {...props} />;
export const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Users {...defaultProps} {...props} />;
export const HeartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Heart {...defaultProps} {...props} />;
export const HomeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Home {...defaultProps} {...props} />;
export const BrainIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Brain {...defaultProps} {...props} />;
export const AppleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Apple {...defaultProps} {...props} />;
export const BabyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Baby {...defaultProps} {...props} />;
export const PlayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Play {...defaultProps} {...props} fill="currentColor" />;
export const StopIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Square {...defaultProps} {...props} fill="currentColor" />;
export const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <ChevronRight {...defaultProps} {...props} />;
export const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Search {...defaultProps} {...props} />;
export const AlertIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <AlertCircle {...defaultProps} {...props} />;
export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Sparkles {...defaultProps} {...props} />;
export const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <ArrowLeft {...defaultProps} {...props} />;

// New icons for Veo features
export const KeyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Key {...defaultProps} {...props} />;
export const ArrowRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <ArrowRight {...defaultProps} {...props} />;
export const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <ChevronDown {...defaultProps} {...props} />;
// New Icons for Sound Therapy
export const MusicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Music {...defaultProps} {...props} />;
export const HeadphonesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Headphones {...defaultProps} {...props} />;
export const PauseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Pause {...defaultProps} {...props} fill="currentColor" />;
export const VolumeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Volume2 {...defaultProps} {...props} />;
export const DnaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Dna {...defaultProps} {...props} />;
export const MaximizeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Maximize2 {...defaultProps} {...props} />;