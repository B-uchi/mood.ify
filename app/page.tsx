"use client";
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Sparkles, Share2, Clock, Heart, Wand2 } from "lucide-react";
import { generateNotePositions } from "@/utils/generateNotePositions";
import { MoodType, NotePosition, statData, StatsItem } from "@/lib/types/types";
import PersonalizeModal from "@/components/personalizeModal";
import { getMoodClasses } from "@/utils/moodClasses";
import { alerta, ToastBox } from "alertajs";
import Loading from "@/components/loading";
import { useRouter } from "next/navigation";

const NOTES_COUNT = 25;

const LandingPage: React.FC = () => {
  const headerRef = useRef<HTMLElement | null>(null);
  const moodInputRef = useRef<HTMLDivElement | null>(null);
  const statsRef = useRef<HTMLDivElement | null>(null);
  const notesContainerRef = useRef<HTMLDivElement | null>(null);
  const backgroundRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const [mood, setMood] = useState<MoodType>("default");
  const [moodInput, setMoodInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState<statData>({
    totalGenerated: 0,
    totalPlaylistDuration: 0,
    totalShares: 0,
    totalUsers: 0,
  });
  const [favArtists, setFavArtists] = useState<string[]>([]);
  const [favTracks, setFavTracks] = useState<string[]>([]);
  const [notePositions, setNotePositions] = useState<NotePosition[]>([]);
  const [loading, setLoading] = useState(false);

  const generatePlaylist = async () => {
    setLoading(true);
    if (!moodInput) {
      setLoading(false);
      return alerta.error("Text input is required", {
        title: "Oops!",
      });
    } else {
      if (!process.env.NEXT_PUBLIC_API_KEY_SECRET) {
        setLoading(false);

        alerta.error("Client side auth error", { title: "Oops!" });
        return;
      }
      const apiUrl = process.env.NEXT_PUBLIC_WEB_URL + "/api/generate-playlist";
      const response = await fetch(apiUrl, {
        method: "POST",
        body: JSON.stringify({
          mood,
          moodInput,
          seedTracks: favTracks,
          seedArtists: favArtists,
          seedGenres: [],
        }),
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_API_KEY_SECRET,
        },
      });
      if (response.status == 200) {
        const data = await response.json();
        sessionStorage.setItem("tracks", btoa(JSON.stringify(data)));
        sessionStorage.setItem("mood", mood);
        setLoading(false);
        router.push("/playlist");
      } else if (response.status == 401) {
        setLoading(false);
        alerta.error("Unknown origin or invalid api key", { title: "Oops!" });
      } else if (response.status == 403) {
        setLoading(false);
        alerta.error("Refine your input.", { title: "Rejected!" });
      } else {
        setLoading(false);
        alerta.error("Server error", { title: "Oops!" });
        return;
      }
    }
  };

  const moodButtons: MoodType[] = [
    "happy",
    "chill",
    "energetic",
    "melancholic",
    "focused",
  ];

  const statsItems: StatsItem[] = [
    {
      icon: Sparkles,
      label: "Playlists Generated",
      value: "" + stats?.totalGenerated,
    },
    { icon: Share2, label: "Shared Moments", value: "" + stats?.totalShares },
    {
      icon: Clock,
      label: "Hours of Music",
      value: "" + stats?.totalPlaylistDuration,
    },
    { icon: Heart, label: "Happy Users", value: "" + stats?.totalUsers },
  ];

  const moodClasses = getMoodClasses(mood);

  useEffect(() => {
    const fetchStats = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_WEB_URL + "/api/stats";
      if (!process.env.NEXT_PUBLIC_API_KEY_SECRET) {
        setLoading(false);

        alerta.error("Client side auth error", { title: "Oops!" });
        return;
      }
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_API_KEY_SECRET,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else {
        alerta.error("Error fetching stats", { title: "Oops!" });
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    sessionStorage.clear();
    setNotePositions(generateNotePositions(NOTES_COUNT));
  }, []);

  useEffect(() => {
    if (backgroundRef.current) {
      gsap.to(backgroundRef.current, {
        opacity: 0.3,
        duration: 0.4,
        onComplete: () => {
          if (backgroundRef.current) {
            gsap.to(backgroundRef.current, {
              opacity: 1,
              duration: 0.4,
            });
          }
        },
      });
    }
  }, [mood]);

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
          { opacity: 0, y: -40 },
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
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal]);

  return (
    <>
      <div className="min-h-screen font-josefin-sans text-white relative overflow-hidden">
        <div className="text-black/80">
          <ToastBox position="top-right" />
        </div>
        <div
          ref={backgroundRef}
          className={`fixed inset-0 bg-gradient-to-br ${moodClasses.background} transition-colors duration-400`}
        />
        <div
          ref={notesContainerRef}
          className="absolute inset-0 pointer-events-none"
        >
          {notePositions.map(({ id, left, top }) => (
            <div
              key={id}
              className={`absolute ${moodClasses.text} opacity-20 text-6xl`}
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              ♪
            </div>
          ))}
        </div>

        {loading && <Loading type={"loading"} />}
        {!loading && (
          <>
            {showModal && (
              <div>
                <PersonalizeModal
                  mood={mood}
                  showModal={showModal}
                  setShowModal={setShowModal}
                  favArtists={favArtists}
                  favTracks={favTracks}
                  setFavArtists={setFavArtists}
                  setFavTracks={setFavTracks}
                />
              </div>
            )}

            <div className="container mx-auto px-4 py-10 relative">
              <header ref={headerRef} className="text-center mb-10">
                <h1 className="text-6xl font-bold mb-4">
                  <span className="text-white">mood</span>
                  <span className={`${moodClasses.secondary} italic`}>
                    .ify
                  </span>
                </h1>
                <p className={`text-xl ${moodClasses.text}`}>
                  Transform your feelings into the perfect playlist
                </p>
              </header>

              <div ref={moodInputRef} className="max-w-2xl mx-auto mb-10">
                <div className="flex items-center pr-2 rounded-2xl bg-white/10 backdrop-blur-sm border-2 border-white/20">
                  <input
                    type="text"
                    placeholder="How do you feel..."
                    value={moodInput}
                    onChange={(e) => setMoodInput(e.target.value)}
                    className={`w-full h-16 pr-2 pl-6 border-none bg-transparent text-lg ${moodClasses.text} ${moodClasses.placeholder} focus:border-none focus:ring-0 focus:outline-none transition-all duration-300`}
                  />
                  <button
                    onClick={() => generatePlaylist()}
                    className={`${moodClasses.button} h-12 px-6 rounded-xl transition-all duration-300`}
                  >
                    Generate
                  </button>
                </div>

                <div className="flex flex-wrap gap-3 justify-center mt-6">
                  {moodButtons.map((moodOption) => {
                    const optionClasses = getMoodClasses(moodOption);
                    return (
                      <button
                        key={moodOption}
                        onClick={() => {
                          if (mood == moodOption) {
                            setMood("default");
                          } else {
                            setMood(moodOption);
                          }
                        }}
                        className={`border-white/30 p-2 px-3 rounded-md ${
                          mood === moodOption
                            ? optionClasses.button
                            : "bg-black/20"
                        } border-[1px] ${
                          optionClasses.text
                        } transition-all duration-300`}
                      >
                        {moodOption.charAt(0).toUpperCase() +
                          moodOption.slice(1)}
                      </button>
                    );
                  })}
                </div>

                <div className="flex mt-6 justify-center">
                  <button
                    onClick={() => setShowModal(true)}
                    className={`inline-flex gap-1 ${moodClasses.text} hover:${moodClasses.secondary} transition-colors duration-300`}
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
                    className="text-center cursor-pointer p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all duration-300"
                  >
                    <Icon
                      className={`w-8 h-8 mx-auto mb-3 ${moodClasses.secondary}`}
                    />
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {value}
                    </h3>
                    <p className={`${moodClasses.text} text-sm`}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default LandingPage;
