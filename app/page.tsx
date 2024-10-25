"use client";
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import { Music, Sparkles, Share2, Clock, Heart } from "lucide-react";

interface StatsItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

interface NotePosition {
  id: number;
  left: number;
  top: number;
}

const NOTES_COUNT = 25;

const LandingPage: React.FC = () => {
  const headerRef = useRef<HTMLElement | null>(null);
  const moodInputRef = useRef<HTMLDivElement | null>(null);
  const statsRef = useRef<HTMLDivElement | null>(null);
  const notesContainerRef = useRef<HTMLDivElement | null>(null);

  const [notePositions, setNotePositions] = useState<NotePosition[]>([]);

  const moodButtons: string[] = [
    "Happy",
    "Chill",
    "Energetic",
    "Melancholic",
    "Focused",
  ];

  const statsItems: StatsItem[] = [
    { icon: Sparkles, label: "Playlists Generated", value: "50K+" },
    { icon: Share2, label: "Shared Moments", value: "25K+" },
    { icon: Clock, label: "Hours of Music", value: "100K+" },
    { icon: Heart, label: "Happy Users", value: "10K+" },
  ];

  useEffect(() => {
    setNotePositions(generateNotePositions(NOTES_COUNT));
  }, []);

  useEffect(() => {
    const headerElement = headerRef.current;
    const moodInputElement = moodInputRef.current;
    const statsElement = statsRef.current;
    const notesContainer = notesContainerRef.current;

    if (!notesContainer || notePositions.length === 0) return;

    const noteElements = Array.from(notesContainer.children) as HTMLElement[];

    const animations = gsap.context(() => {
      if (headerElement) {
        gsap.from(headerElement, {
          y: -50,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
        });
      }

      if (moodInputElement) {
        gsap.from(moodInputElement, {
          scale: 0.9,
          opacity: 0,
          duration: 1,
          delay: 0.5,
          ease: "back.out",
        });
      }
      if (statsElement?.children) {
        gsap.fromTo(
          statsElement.children,
          {
            opacity: 0,
            y: -40,
          },
          {
            stagger: 0.2,
            opacity: 1,
            duration: 1,
            delay: 0.5,
            ease: "back.in(1.7)",
            y: 0,
          }
        );
      }

      noteElements.forEach((note, index) => {
        gsap.to(note, {
          y: index % 2 === 0 ? "20" : "-20",
          x: index % 2 === 0 ? "20" : "-20",
          rotation: index % 2 === 0 ? "15" : "-15",
          duration: 2 + (index % 2),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
    });

    return () => animations.revert();
  }, [notePositions]);

  const handleMoodButtonClick = (mood: string): void => {
    console.log(`Selected mood: ${mood}`);
  };

  const handleGenerateClick = (): void => {
    console.log("Generate playlist");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    console.log(e.target.value);
  };

  function generateNotePositions(count: number): NotePosition[] {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: (i * 237) % 100,
      top: (i * (i * i)) % 100,
    }));
  }

  return (
    <div className="min-h-screen font-josefin-sans bg-gradient-to-br from-purple-900 via-purple-700 to-purple-900 text-white relative overflow-hidden">
      <div
        ref={notesContainerRef}
        className="absolute inset-0 pointer-events-none"
      >
        {notePositions.map(({ id, left, top }) => (
          <div
            key={id}
            className="absolute text-purple-300 opacity-20 text-6xl"
            style={{
              left: `${left}%`,
              top: `${top}%`,
            }}
          >
            ♪
          </div>
        ))}
      </div>

      <div className="container mx-auto px-4 py-12">
        <header ref={headerRef} className="text-center mb-16 ">
          <h1 className="text-6xl font-bold mb-4">
            <span className="text-white">mood</span>
            <span className="text-teal-400 italic">.ify</span>
          </h1>
          <p className="text-xl text-purple-200">
            Transform your feelings into the perfect playlist
          </p>
        </header>

        <div ref={moodInputRef} className="max-w-2xl mx-auto mb-12">
          <div className="flex items-center pr-2 rounded-2xl bg-white/10 backdrop-blur-sm border-2 border-white/20">
            <input
              type="text"
              placeholder="Type your feeling..."
              
              onChange={handleInputChange}
              className="w-full h-16 pr-2 pl-6 border-none bg-transparent text-lg placeholder:text-purple-300 focus:border-none focus:ring-0 focus:outline-none transition-all duration-300"
            />
            <Button
              onClick={handleGenerateClick}
              className="bg-teal-500 hover:bg-teal-600 h-12 px-6 rounded-xl transition-all duration-300"
            >
              Generate
            </Button>
          </div>

          <div className="flex flex-wrap gap-3 justify-center mt-6">
            {moodButtons.map((mood) => (
              <button
                key={mood}
                onClick={() => handleMoodButtonClick(mood)}
                className="border-white/30 p-2 px-3 rounded-lg bg-[#313131] hover:bg-[#313131] bg-opacity-40 border-[1px] text-purple-200 transition-all duration-300"
              >
                {mood}
              </button>
            ))}
          </div>
        </div>

        <div
          ref={statsRef}
          className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-16"
        >
          {statsItems.map(({ icon: Icon, label, value }, index) => (
            <div
              key={index}
              className="text-center cursor-pointer p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-teal-400/30 transition-all duration-300"
            >
              <Icon className="w-8 h-8 mx-auto mb-3 text-teal-400" />
              <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
              <p className="text-purple-200 text-sm">{label}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button
            onClick={() => console.log("CTA clicked")}
            className="bg-teal-500 hover:bg-teal-600 text-lg px-8 py-6 rounded-xl transition-all duration-300"
          >
            <Music className="w-5 h-5 mr-2" />
            Start Your Musical Journey
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
