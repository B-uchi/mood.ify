import { alerta } from "alertajs";
import { FastForward, PauseCircle, PlayCircle, Rewind } from "lucide-react";
import React, { useState, useEffect, useCallback, useRef } from "react";
import SongProgressBar from "./songProgressBar";
import Image from "next/image";
import { usePathname } from "next/navigation";

const track = {
  name: "",
  album: {
    images: [{ url: "" }],
  },
  artists: [{ name: "" }],
  duration_ms: 0,
};

type Props = {
  token: string;
  playTrack: any;
};

function WebPlayback(props: Props) {
  const [isPaused, setIsPaused] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [trackPosition, setTrackPosition] = useState<number>(0);
  const [transferringPlayback, setTransferringPlayback] = useState(true);
  const [player, setPlayer] = useState<any | null>(null);
  const [deviceId, setDeviceId] = useState("");
  const [currentTrack, setCurrentTrack] = useState(track);

  const pathname = usePathname();
  const playerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        console.log("Disconnecting player due to navigation");
        playerRef.current.disconnect();
        setPlayer(null);
        playerRef.current = null;
      }
    };
  }, [pathname]);

  useEffect(() => {
    const playTrack = async () => {
      if (deviceId) {
        const response = await fetch(
          `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
          {
            method: "PUT",
            body: JSON.stringify({
              uris: [props.playTrack.uri],
              position_ms: 0,
            }),
            headers: {
              Authorization: "Bearer " + props.token,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.status == 204) {
          alerta.success("Playback started", { title: "Hurray!" });
        } else if (response.status == 401 || 403) {
          alerta.error("Couldn't start playback", {
            title: "Oops!",
          });
        } else if (response.status == 429) {
          alerta.error("Rate exceeded", { title: "Oops!" });
        } else {
          const error = await response.json();
          console.log(error);
        }
      }
    };
    playTrack();
  }, [props.playTrack, deviceId]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: "Mood.ify Web Player",
        getOAuthToken: (cb: (token: string) => void) => {
          cb(props.token);
        },
        volume: 0.5,
      });

      setPlayer(spotifyPlayer);
      playerRef.current = spotifyPlayer;

      spotifyPlayer.addListener(
        "ready",
        ({ device_id }: { device_id: string }) => {
          setDeviceId(device_id);
          console.log("Ready to play");
        }
      );

      spotifyPlayer.addListener("not_ready", () => {
        console.log("Device has gone offline");
      });

      spotifyPlayer.addListener("player_state_changed", (state: any) => {
        if (!state) return;
        setTrackPosition(state.position);
        setCurrentTrack(state.track_window.current_track);
        setIsPaused(state.paused);
        setIsActive(true);
      });

      spotifyPlayer.connect();
    };

    return () => {
      if (playerRef.current) {
        console.log("Disconnecting player in cleanup");
        playerRef.current.disconnect();
        setPlayer(null);
        playerRef.current = null;
      }
      const spotifyScript = document.querySelector(
        'script[src="https://sdk.scdn.co/spotify-player.js"]'
      );
      if (spotifyScript) {
        spotifyScript.remove();
      }
    };
  }, [props.token]);

  // useEffect(() => {
  //   const script = document.createElement("script");
  //   script.src = "https://sdk.scdn.co/spotify-player.js";
  //   script.async = true;

  //   document.body.appendChild(script);

  //   window.onSpotifyWebPlaybackSDKReady = () => {
  //     const player = new window.Spotify.Player({
  //       name: "Mood.ify Web Player",
  //       getOAuthToken: (cb: (token: string) => void) => {
  //         cb(props.token);
  //       },
  //       volume: 0.5,
  //     });

  //     setPlayer(player);

  //     player.addListener("ready", ({ device_id }: { device_id: string }) => {
  //       setDeviceId(device_id);
  //       console.log("Ready to play");
  //     });

  //     player.addListener("not_ready", () => {
  //       console.log("Device has gone offline");
  //     });

  //     player.addListener("player_state_changed", (state: any) => {
  //       if (!state) {
  //         return;
  //       }

  //       setTrackPosition(state.position);
  //       setCurrentTrack(state.track_window.current_track);
  //       setIsPaused(state.paused);
  //       setIsActive(true);
  //     });

  //     player.connect();
  //   };

  //   return () => {
  //     if (player) {
  //       player.disconnect();
  //     }
  //   };
  // }, [props.token, router]);

  useEffect(() => {
    const transferPlaybackToMoodify = async () => {
      if (deviceId) {
        const response = await fetch("https://api.spotify.com/v1/me/player", {
          method: "PUT",
          body: JSON.stringify({
            device_ids: [deviceId],
            play: true,
          }),
          headers: {
            Authorization: "Bearer " + props.token,
            "Content-Type": "application/json",
          },
        });

        if (response.status == 204) {
          alerta.success("Playback transferred", { title: "Hurray!" });
        } else if (response.status == 401 || 403) {
          alerta.error("Manually transfer playback to continue", {
            title: "Couldn't transfer playback",
          });
        } else if (response.status == 429) {
          alerta.error("Rate exceeded", { title: "Oops!" });
        }

        setTransferringPlayback(false);
        return;
      }
    };
    transferPlaybackToMoodify();
  }, [deviceId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        player.togglePlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [player]);

  const togglePlay = useCallback(async () => {
    if (player) {
      player?.togglePlay().then(() => {
        setIsPaused(!isPaused);
      });
    }
  }, [player, isPaused]);

  if (!isActive && transferringPlayback) {
    return (
      <div className="container">
        <div className="main-wrapper">
          <b>Please wait. Attempting to transfer playback</b>
        </div>
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className="container">
        <div className="main-wrapper">
          <b>
            Instance not active. Transfer your playback using your Spotify app
          </b>
        </div>
      </div>
    );
  }

  return (
    <div className="flex md:flex-row flex-col gap-2 justify-center items-center h-full container">
      <div className="md:w-1/2">
        <Image
          src={currentTrack?.album.images[0].url}
          alt={`${currentTrack?.name} cover`}
          className="now-playing__cover rounded-md mx-auto"
          height={400}
          width={400}
        />
      </div>
      <div className="md:w-1/2 space-y-5 md:space-y-10 w-full">
        <div className="now-playing__side">
          <div className="text-2xl mt-2 md:text-3xl font-bold">
            Track: {currentTrack?.name}
          </div>
          <div className="now-playing__artist">
            Artist(s): {currentTrack?.artists[0].name}
          </div>
        </div>
        <SongProgressBar
          currentPosition={trackPosition}
          isPlaying={!isPaused}
          duration={currentTrack?.duration_ms}
        />
        <div className="flex justify-between">
          <button
            className="btn-spotify"
            onClick={() => player?.previousTrack()}
          >
            <Rewind size={55} />
          </button>

          <button className="btn-spotify" onClick={togglePlay}>
            {isPaused ? <PlayCircle size={55} /> : <PauseCircle size={55} />}
          </button>

          <button className="btn-spotify" onClick={() => player?.nextTrack()}>
            <FastForward size={55} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default WebPlayback;
