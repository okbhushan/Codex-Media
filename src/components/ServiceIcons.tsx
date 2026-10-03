import React from 'react';
import { Wifi, Home, Tv, Music, Cloud, Dumbbell, Globe, Sparkles } from 'lucide-react';
import { IconType } from '../types';

interface ServiceIconProps {
  type: IconType;
  className?: string;
  size?: number;
}

export const ServiceIcon: React.FC<ServiceIconProps> = ({ type, className = '', size = 20 }) => {
  switch (type) {
    case 'wifi':
      return <Wifi size={size} className={className || 'text-violet-300'} strokeWidth={2.2} />;
      
    case 'youtube':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className || 'text-red-400'}
        >
          <path
            d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43z"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
        </svg>
      );

    case 'apple':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          className={className || 'text-white'}
        >
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.74 1.02-1.77.91-2.8-.88.04-1.95.59-2.58 1.33-.56.65-.96 1.7-.83 2.7.98.08 1.99-.49 2.5-1.23z" />
        </svg>
      );

    case 'house':
      return <Home size={size} className={className || 'text-purple-300'} strokeWidth={2.2} />;

    case 'netflix':
      return (
        <span className={`font-black text-xs tracking-tighter ${className || 'text-red-500'}`}>
          N
        </span>
      );

    case 'spotify':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className || 'text-emerald-400'}
        >
          <path d="M12 2C6.477 2 2 6.477 2 12c0 5.524 4.477 10 10 10 5.522 0 10-4.476 10-10 0-5.523-4.478-10-10-10zm4.587 14.426a.627.627 0 0 1-.86.208c-2.355-1.439-5.32-1.765-8.814-.967a.627.627 0 1 1-.28-1.222c3.826-.874 7.106-.5 9.746 1.12.308.188.402.588.208.861zm1.226-2.724a.784.784 0 0 1-1.077.258c-2.696-1.658-6.807-2.136-9.996-1.168a.784.784 0 0 1-.462-1.498c3.64-1.106 8.19-.575 11.277 1.328.375.231.488.723.258 1.08zm.106-2.835C14.693 8.97 9.385 8.793 6.305 9.728a.94.94 0 1 1-.55-1.799c3.54-1.074 9.404-.863 13.15 1.36a.941.941 0 0 1-.986 1.578z" />
        </svg>
      );

    case 'amazon':
      return <Tv size={size} className={className || 'text-amber-400'} strokeWidth={2.2} />;

    case 'cloud':
      return <Cloud size={size} className={className || 'text-sky-400'} strokeWidth={2.2} />;

    case 'gym':
      return <Dumbbell size={size} className={className || 'text-orange-400'} strokeWidth={2.2} />;

    case 'music':
      return <Music size={size} className={className || 'text-pink-400'} strokeWidth={2.2} />;

    case 'generic':
    default:
      return <Sparkles size={size} className={className || 'text-purple-300'} strokeWidth={2.2} />;
  }
};

export const getIconBoxStyles = (type: IconType): { bg: string; border: string } => {
  switch (type) {
    case 'youtube':
      return {
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
      };
    case 'apple':
      return {
        bg: 'bg-white/10',
        border: 'border-white/20',
      };
    case 'spotify':
      return {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
      };
    case 'wifi':
      return {
        bg: 'bg-violet-500/15',
        border: 'border-violet-500/30',
      };
    case 'house':
      return {
        bg: 'bg-purple-600/15',
        border: 'border-purple-500/30',
      };
    case 'amazon':
      return {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
      };
    case 'gym':
      return {
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/20',
      };
    default:
      return {
        bg: 'bg-purple-500/15',
        border: 'border-purple-500/25',
      };
  }
};
