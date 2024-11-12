import React, { useState } from 'react';
import { ArrowLeft, Share2, PlusCircle, LucideProps } from 'lucide-react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { MoodClasses } from '@/lib/types/types';

type IconButtonProps = {
    icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
    label: string;
    onClick: () => void;
    moodClasses: MoodClasses

}
const IconButton = ({ icon: Icon, label, onClick, moodClasses }: IconButtonProps) => {
  const [showLabel, setShowLabel] = useState(false);
  
  return (
    <div className="relative inline-flex items-center group">
      <button
        onClick={onClick}
        onMouseEnter={() => setShowLabel(true)}
        onMouseLeave={() => setShowLabel(false)}
        className={`${moodClasses.button}/10 p-5 rounded-full transition-all duration-200 hover:scale-110`}
      >
        <Icon />
      </button>
      
      {/* Desktop label */}
      <span 
        className={`
          hidden md:block absolute 
          ${label === 'Back' ? 'left-full' : ""}
          ${label === 'Share playlist' ? 'right-full' : ""}
          ${label === 'Save to spotify' ? 'left-full' : ""}
          top-1/2 -translate-y-1/2
          px-2 py-1 mx-2
          bg-black/80 text-white
          rounded-md text-sm
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
          whitespace-nowrap
        `}
      >
        {label}
      </span>
      
      {/* Mobile tooltip */}
      <span 
        className={`
          md:hidden absolute
          left-1/2 -translate-x-1/2
          ${showLabel ? 'bottom-full' : '-bottom-full'}
          mb-2
          px-2 py-1
          bg-black/80 text-white
          rounded-md text-sm
          transition-all duration-200
          whitespace-nowrap
          ${showLabel ? 'opacity-100' : 'opacity-0'}
        `}
      >
        {label}
      </span>
    </div>
  );
};

type HeaderProps={
    router: AppRouterInstance
    moodClasses: MoodClasses
}

const PlaylistHeader = ({ moodClasses, router }: HeaderProps) => {
  return (
    <header className="text-center relative py-6 md:py-10">
      <div className="flex justify-center space-x-4">
        <div className="self-start justify-self mb-5 md:absolute left-36 top-1/2 md:-translate-y-[50%]">
          <IconButton
            icon={ArrowLeft}
            label="Back"
            onClick={() => router.push("/")}
            moodClasses={moodClasses}
          />
        </div>
        
        <div className="self-start space-x-4 justify-self md:absolute right-36 top-1/2 md:-translate-y-[50%]">
          <IconButton
            icon={Share2}
            label="Share playlist"
            onClick={() => router.push("/")}
            moodClasses={moodClasses}
          />
          <IconButton
            icon={PlusCircle}
            label="Save to spotify"
            onClick={() => router.push("/")}
            moodClasses={moodClasses}
          />
        </div>
      </div>
      
      <div>
        <h1 className="text-5xl font-bold">
          <span className="text-white">Your</span>
          <span className={`${moodClasses.secondary} italic`}> Playlist</span>
        </h1>
        <p className={`text-xl mt-4 ${moodClasses.text}`}>
          Enjoy your mood-curated tracks
        </p>
      </div>
    </header>
  );
};

export default PlaylistHeader;