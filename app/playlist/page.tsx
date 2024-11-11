"use client";
import MusicalNotes from "@/components/loading";
import { MoodType, NotePosition } from "@/lib/types/types";
import { generateNotePositions } from "@/utils/generateNotePositions";
import { getMoodClasses } from "@/utils/moodClasses";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NOTES_COUNT } from "../page";
import gsap from "gsap";
import { alerta, ToastBox } from "alertajs";
import { cookies } from "next/headers";
import Spinner from "@/components/spinner";
import WebPlayback from "@/components/WebPlayback";

const Page = () => {
  const [loading, setLoading] = useState(true);
  const notesContainerRef = useRef<HTMLDivElement | null>(null);
  const [mood, setMood] = useState<MoodType>("default");
  const [notePositions, setNotePositions] = useState<NotePosition[]>([]);
  const [tracks, setTracks] = useState([]);
  const [token, setToken] = useState("");
  const [checkingToken, setCheckingToken] = useState(true);
  const [isToken, setIsToken] = useState(false);
  let moodClasses = getMoodClasses(mood);
  const router = useRouter();
  useEffect(() => {
    moodClasses = getMoodClasses(mood);
  }, [mood]);

  useEffect(() => {
    const checkStorage = () => {
      const stored_tracks = sessionStorage.getItem("tracks");
      const stored_mood = sessionStorage.getItem("mood");

      if (stored_mood) {
        setMood((stored_mood as MoodType) || "default");
      }

      if (!stored_tracks) {
        setLoading(false);
        router.push("/");
        return;
      }
      setTracks(stored_tracks ? JSON.parse(atob(stored_tracks)).data : []);
      setLoading(false);
    };
    checkStorage();
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      const apiUrl =
        process.env.NEXT_PUBLIC_WEB_URL + "/api/spotify-auth/token";
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_API_KEY_SECRET || "",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        setIsToken(true);
        setCheckingToken(false);
      }
      setCheckingToken(false);
    };
    checkToken();
  }, []);

  useEffect(() => {
    setNotePositions(generateNotePositions(NOTES_COUNT));
  }, []);

  useEffect(() => {
    const notesContainer = notesContainerRef.current;

    if (!notesContainer || notePositions.length === 0) return;

    const noteElements = Array.from(notesContainer.children) as HTMLElement[];

    const animations = gsap.context(() => {
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

  function formatTimestamp(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    return `${minutes}:${formattedSeconds}`;
  }

  const connectSpotify = async () => {
    if (!process.env.NEXT_PUBLIC_API_KEY_SECRET) {
      setLoading(false);

      alerta.error("Client side auth error", { title: "Oops!" });
      return;
    }
    window.location.href = "/api/spotify-auth/login";
  };

  return (
    <div className="">
      {loading && <MusicalNotes mood={mood} type="loading" />}
      {!loading && (
        <div
          className={`fixed overflow-auto h-screen font-josefin-sans text-white flex flex-col inset-0 bg-gradient-to-br ${moodClasses.background} transition-colors duration-400`}
        >
          <ToastBox position="top-right" />
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

          <header className="text-center py-10">
            <h1 className="text-5xl font-bold">
              <span className="text-white">Your</span>
              <span className={`${moodClasses.secondary} italic`}>
                {" "}
                Playlist
              </span>
            </h1>
            <p className={`text-xl mt-4 ${moodClasses.text}`}>
              Enjoy your mood-curated tracks
            </p>
          </header>

          <div className="flex lg:flex-row flex-col-reverse px-8 lg:px-20 gap-6">
            <div className="w-full lg:w-1/3 lg:mb-0 mb-5 p-4 rounded-lg backdrop-blur-sm bg-white/10 border border-white/20">
              <h2 className="text-2xl font-semibold mb-4">Tracks</h2>
              {!tracks && <Spinner />}
              {tracks && (
                <ul className="space-y-4">
                  {tracks.map((track: any, index: number) => (
                    <div
                      key={track.id}
                      className="flex items-center gap-3 w-full"
                    >
                      {index + 1}
                      <li className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition cursor-pointer w-full">
                        <div className="flex items-center gap-4">
                          <img
                            src={track.album.images[0].url}
                            alt={`${track.name} cover`}
                            className="w-12 h-12 rounded-md"
                          />
                          <div className="w-full">
                            <h3 className="text-md font-medium line-clamp-1">
                              {track.name}
                            </h3>
                            <div className="flex justify-between gap-2">
                              <p
                                className={`text-sm ${moodClasses.text} flex-grow line-clamp-1`}
                              >
                                {track.artists
                                  .map((artist: any) => artist.name)
                                  .join(", ")}
                              </p>
                              <p>{formatTimestamp(track.duration_ms)}</p>
                            </div>
                          </div>
                        </div>
                      </li>
                    </div>
                  ))}
                </ul>
              )}
            </div>
            <div className="w-full lg:w-2/3 p-4 rounded-lg backdrop-blur-sm bg-white/10 border border-white/20">
              {checkingToken && (
                <div className="h-full flex justify-center items-center">
                  <Spinner />
                </div>
              )}
              {!checkingToken && !isToken && (
                <>
                  <h2 className="text-2xl font-semibold mb-4 text">
                    Connect to spotify to listen
                  </h2>
                  <div className="w-full h-80 flex items-center justify-center">
                    <button
                      onClick={() => connectSpotify()}
                      className="bg-[#1ed760] font-extrabold p-3 px-5 rounded-full"
                    >
                      Connect
                    </button>
                  </div>
                </>
              )}
              {!checkingToken && isToken && (
                <div className="h-full">
                  {" "}
                  <h2 className="text-2xl font-semibold">Listen Now</h2>
                  <WebPlayback token={token} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
