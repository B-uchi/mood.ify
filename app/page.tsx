"use client";
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import {
  Music,
  Sparkles,
  Share2,
  Clock,
  Heart,
  Wand2,
  Search,
} from "lucide-react";
import { searchForArtists } from "@/utils/findArtists";
import { searchForTrack } from "@/utils/findTrack";

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
  const modalRef = useRef<HTMLDivElement | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [artistName, setArtistName] = useState("");
  const [trackName, setTrackName] = useState("");
  const [favArtists, setFavArtists] = useState<string[]>([]);
  const [favTracks, setFavTracks] = useState<string[]>([]);
  const [favGenres, setFavGenres] = useState<string[]>([]);

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

  useEffect(() => {
    const modalElement = modalRef.current;

    if (showModal && modalElement) {
      gsap.fromTo(
        modalElement,
        { x: 200, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: "back.out", stagger: 0.2 }
      );
    }
  }, [showModal]);

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
      {showModal && (
        <div className="h-[100vh] text-[#2D3748] w-full backdrop-blur-sm absolute bg-white/30 z-10 flex justify-center items-center">
          <div ref={modalRef} className="lg:w-[40%] w-[90%] relative p-4 h-[90%] gap-10 flex flex-col bg-white/80 rounded-md">
            <div className="">
              <h1 className="text-xl font-bold">Personalize your results</h1>
              <p>The more you tell us, the better the result</p>
            </div>
            <div className="">
              <div className="">
                <h1 className="font-bold">1.) Tell us your favorite artist(s)</h1>
                <form onSubmit={(e)=>searchForArtists(e, artistName)} className="border-[1px] bg-white border-[#efefef] rounded-full w-[50%] p-2 flex">
                  <input
                    type="text"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    placeholder="Artist name"
                    className="bg-transparent focus:outline-none outline-none w-full"
                  />
                  <button type="submit" onClick={(e)=>searchForArtists(e, artistName)} className="text-[#6B46C1] rounded-full p-2 ml-2">
                    <Search />
                  </button>
                </form>
              </div>
              <div className="mt-10">
                <h1 className="font-bold">2.) Tell us your favorite track(s)</h1>
                <form onSubmit={(e)=>searchForTrack(e, artistName)} className="border-[1px] bg-white border-[#efefef] rounded-full w-[50%] p-2 flex">
                  <input
                    type="text"
                    value={trackName}
                    onChange={(e) => setTrackName(e.target.value)}
                    placeholder="Track name"
                    className="bg-transparent focus:outline-none outline-none w-full"
                  />
                  <button type="submit" onClick={(e)=>searchForTrack(e, artistName)} className="text-[#6B46C1] rounded-full p-2 ml-2">
                    <Search />
                  </button>
                </form>{" "}
              </div>
              {/* <div className="mt-10">
                <h1 className="font-bold">3.) Tell us your favorite genres</h1>
                <div className="border-[1px] bg-white border-[#efefef] rounded-full w-[50%] p-2 flex">
                  <input
                    type="text"
                    placeholder="Genre name"
                    className="bg-transparent focus:outline-none outline-none w-full"
                  />
                  <button className="text-[#6B46C1] rounded-full p-2 ml-2">
                    <Search />
                  </button>
                </div>{" "}
              </div> */}
            </div>
            <div className="absolute left-0 bottom-0 w-full flex">
              <button
                className="w-1/2 py-3 bg-teal-500 hover:bg-teal-400 rounded-bl-md"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="w-1/2 py-3 bg-[#6B46C1] hover:bg-[#8258e6] rounded-br-md">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
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

      <div className="container mx-auto px-4 py-10">
        <header ref={headerRef} className="text-center mb-10 ">
          <h1 className="text-6xl font-bold mb-4">
            <span className="text-white">mood</span>
            <span className="text-teal-400 italic">.ify</span>
          </h1>
          <p className="text-xl text-purple-200">
            Transform your feelings into the perfect playlist
          </p>
        </header>

        <div ref={moodInputRef} className="max-w-2xl mx-auto mb-10">
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

          <div className="flex mt-6 justify-center">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex gap-1"
            >
              Personalize <Wand2 />
            </button>
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
