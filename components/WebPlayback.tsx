import { alerta } from "alertajs";
import { FastForward, PauseCircle, PlayCircle, Rewind } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";

const track = {
  name: "",
  album: {
    images: [{ url: "" }],
  },
  artists: [{ name: "" }],
};

type Props = {
  token: string;
};

function WebPlayback(props: Props) {
  const [isPaused, setIsPaused] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [transferringPlayback, setTransferringPlayback] = useState(true);
  const [player, setPlayer] = useState<any | null>(null);
  const [deviceId, setDeviceId] = useState("");
  const [currentTrack, setCurrentTrack] = useState(track);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "Mood.ify Web Player",
        getOAuthToken: (cb: (token: string) => void) => {
          cb(props.token);
        },
        volume: 0.5,
      });

      setPlayer(player);

      player.addListener("ready", ({ device_id }: { device_id: string }) => {
        setDeviceId(device_id);
        console.log("Ready to play");
      });

      player.addListener("not_ready", () => {
        console.log("Device has gone offline");
      });

      player.addListener("player_state_changed", (state: any) => {
        if (!state) {
          return;
        }

        setCurrentTrack(state.track_window.current_track);
        setIsPaused(state.paused);
        setIsActive(true);
      });

      player.connect();
    };

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [props.token]);

  useEffect(() => {
    const transferPlaybackToMoodify = async () => {
      if (deviceId) {
        const response = await fetch("https://api.spotify.com/v1/me/player", {
          method: "PUT",
          body: JSON.stringify({
            device_ids: [deviceId],
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

  const togglePlay = useCallback(async () => {
    if (player) {
      player.togglePlay().then(() => {
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
    <div className="container">
      <div className="main-wrapper">
        <img
          src={currentTrack?.album.images[0].url}
          className="now-playing__cover"
          alt=""
        />

        <div className="now-playing__side">
          <div className="now-playing__name">{currentTrack?.name}</div>
          <div className="now-playing__artist">
            {currentTrack?.artists[0].name}
          </div>

          <button
            className="btn-spotify"
            onClick={() => player?.previousTrack()}
          >
            <Rewind />
          </button>

          <button className="btn-spotify" onClick={togglePlay}>
            {isPaused ? <PlayCircle /> : <PauseCircle />}
          </button>

          <button className="btn-spotify" onClick={() => player?.nextTrack()}>
            <FastForward />
          </button>
        </div>
      </div>
    </div>
  );
}

export default WebPlayback;
