"use client";
import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Clock, Search, XCircleIcon } from "lucide-react";
import { searchForArtists } from "@/utils/findArtists";
import { searchForTrack } from "@/utils/findTrack";
import { gsap } from "gsap";
import Spinner from "./spinner";
import { alerta, ToastBox } from "alertajs";

type Props = {
  showModal: boolean;
  favArtists: any[];
  favTracks: any[];
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  setFavArtists: React.Dispatch<React.SetStateAction<string[]>>;
  setFavTracks: React.Dispatch<React.SetStateAction<string[]>>;
};

const PersonalizeModal = (props: Props) => {
  const {
    showModal,
    setShowModal,
    favArtists,
    favTracks,
    setFavArtists,
    setFavTracks,
  } = props;
  let [fetchedArtists, setFetchedArtists] = useState<any[]>();
  let [fetchedTracks, setFetchedTracks] = useState<any[]>([]);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const modalContainerRef = useRef<HTMLDivElement | null>(null);
  const [fetchingTracks, setFetchingTracks] = useState(false);
  const [fetchingArtists, setFetchingArtists] = useState(false);
  const [showFetchedArtists, setShowFetchedArtists] = useState(true);
  const [showFetchedTracks, setShowFetchedTracks] = useState(false);
  const [artistName, setArtistName] = useState("");
  const [trackName, setTrackName] = useState("");

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const artistResults = document.querySelector("#artist-results");
      const trackResults = document.querySelector("#track-results");

      if (artistResults && !artistResults.contains(e.target as Node)) {
        setShowFetchedArtists(false);
      }

      if (trackResults && !trackResults.contains(e.target as Node)) {
        setShowFetchedTracks(false);
      }
    };

    [modalRef, modalContainerRef].forEach((ref) => {
      ref.current?.addEventListener("click", handleClick);
    });

    return () => {
      [modalRef, modalContainerRef].forEach((ref) => {
        ref.current?.removeEventListener("click", handleClick);
      });
    };
  }, []);

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

  const removeArtist = (id: string) => {
    setFavArtists(favArtists.filter((artist) => artist.id != id));
  };

  const removeTrack = (id: string) => {
    setFavTracks(favTracks.filter((track) => track.id != id));
  };

  const personalize = async (
    param: string,
    e:
      | React.FormEvent<HTMLFormElement>
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault()
    if (param == "artist") {
      if (!artistName) {
        return alerta.error("Artist name is required", { title: "Empty field" });
      }
      setFetchingArtists(true);
      setFetchedArtists(await searchForArtists(artistName));
      setFetchingArtists(false);
      setShowFetchedArtists(true);
    } else if (param == "track") {
      if (!trackName) {
        return alerta.error("Track name is required", { title: "Empty field" });
      }
      setFetchingTracks(true);
      setFetchedTracks(await searchForTrack(trackName));
      setFetchingTracks(false);
      setShowFetchedTracks(true);
    }
  };

  return (
    <div
      ref={modalContainerRef}
      className="h-[100vh] text-[#2D3748] w-full backdrop-blur-sm absolute bg-white/30 z-10 flex justify-center items-center"
    >
      <ToastBox position="top-right" />
      <div
        ref={modalRef}
        className="lg:w-[40%] w-[90%] relative p-4 h-[90%] gap-10 flex flex-col bg-white/80 rounded-md"
      >
        <div className="">
          <h1 className="text-xl font-bold">Personalize your results</h1>
          <p>The more you tell us, the better the result</p>
        </div>
        <div className="lg:w-[70%] w-auto">
          <div className="relative " id="artist-results">
            <h1 className="font-bold">1.) Tell us your favorite artist(s)</h1>
            <form
              onSubmit={(e) => personalize("artist", e)}
              onFocus={() => fetchedArtists && setShowFetchedArtists(true)}
              className="border-[1px] bg-white border-[#efefef] rounded-lg p-2 flex"
            >
              <input
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Artist name"
                className="bg-transparent focus:outline-none outline-none w-full"
              />
              {!fetchingArtists && (
                <button
                  type="submit"
                  onClick={(e) => personalize("artist", e)}
                  className="text-[#6B46C1] rounded-full p-2 ml-2"
                >
                  <Search />
                </button>
              )}
              {fetchingArtists && <Spinner />}
            </form>
            {favArtists && (
              <div className="w-full overflow-x-auto mt-2 flex">
                {favArtists.map((artist) => (
                  <div
                    key={artist.id}
                    className="flex bg-white/80 p-2 rounded-full items-center gap-1 mr-3"
                  >
                    <p>{artist.name}</p>{" "}
                    <button onClick={() => removeArtist(artist.id)}>
                      <XCircleIcon size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {showFetchedArtists && fetchedArtists && (
              <div className="absolute bg-white z-10 p-1 flex flex-col gap-3 rounded-md w-full mt-1">
                {fetchedArtists.map((artist: any) => (
                  <div
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-[#e1e1e1] cursor-pointer"
                    onClick={() => {
                      if (favArtists.length == 1) {
                        alerta.error("Can't add more artists on free tier", {
                          title: "Error",
                        });
                      } else {
                        setFavArtists((state) =>
                          artist.id !== "notfound"
                            ? [...state, artist]
                            : [...state]
                        );
                      }
                      setShowFetchedArtists(false);
                    }}
                    key={artist.id}
                  >
                    <img
                      className="w-[25px] rounded-full"
                      src={artist.image}
                      alt="artist image"
                    />
                    <p>{artist.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-5 relative" id="track-results">
            <h1 className="font-bold">2.) Tell us your favorite track(s)</h1>
            <form
              onSubmit={(e) => personalize("track", e)}
              onFocus={() =>
                fetchedTracks.length > 0 && setShowFetchedTracks(true)
              }
              className="border-[1px] bg-white border-[#efefef] rounded-lg p-2 flex"
            >
              <input
                type="text"
                value={trackName}
                onChange={(e) => setTrackName(e.target.value)}
                placeholder="Track name"
                className="bg-transparent focus:outline-none outline-none w-full"
              />
              {!fetchingTracks && (
                <button
                  type="submit"
                  onClick={(e) => personalize("track", e)}
                  className="text-[#6B46C1] rounded-full p-2 ml-2"
                >
                  <Search />
                </button>
              )}
              {fetchingTracks && <Spinner />}
            </form>
            {favTracks && (
              <div className="w-full overflow-x-auto mt-2 flex flex-col items-start">
                {favTracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex bg-white/80 p-2 rounded-full items-center gap-1 mb-2"
                  >
                    <p className="line-clamp-1">{track.name}</p>{" "}
                    <button onClick={() => removeTrack(track.id)}>
                      <XCircleIcon size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {showFetchedTracks && fetchedTracks && (
              <div className="absolute bg-white z-10 p-1 flex flex-col gap-3 rounded-md w-full mt-1">
                {fetchedTracks.map((track: any) => (
                  <div
                    onClick={() => {
                      if (favTracks.length == 1) {
                        alerta.error("Can't add more tracks on free tier", {
                          title: "Error",
                        });
                      } else {
                        setFavTracks((state) =>
                          track.id !== "notfound"
                            ? [...state, track]
                            : [...state]
                        );
                        setShowFetchedTracks(false);
                      }
                    }}
                    className="flex items-center hover:bg-[#e1e1e1] rounded-md gap-2 p-2 cursor-pointer"
                    key={track.id}
                  >
                    <img
                      className="w-[25px] rounded-full"
                      src={track.image}
                      alt="track image"
                    />
                    <p className="line-clamp-1">{track.name}</p>
                  </div>
                ))}
              </div>
            )}
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
  );
};

export default PersonalizeModal;
