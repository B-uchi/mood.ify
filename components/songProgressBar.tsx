import React, { useEffect, useState } from "react";

type ProgressBarProps = {
  duration: number; // Duration of the song in milliseconds
  currentPosition: number; // Initial position in milliseconds (can be 0 at the start)
  isPlaying: boolean; // To determine if the song is playing
};

const SongProgressBar: React.FC<ProgressBarProps> = ({
  duration,
  currentPosition,
  isPlaying,
}) => {
  const [, setProgress] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prevProgress) => {
          const newProgress = prevProgress + 1000;
          const newProgressPercentage = (newProgress / duration) * 100;
          setProgressPercentage(newProgressPercentage);
          if (newProgress >= duration) {
            if (interval) {
              clearInterval(interval);
            }
            return duration;
          }
          return newProgress;
        });
      }, 1000);
    } else {
      if (interval) {
        clearInterval(interval);
      }
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, duration]);

  useEffect(() => {
    setProgress(currentPosition);
    const progressPercentage = (currentPosition / duration) * 100;
    setProgressPercentage(progressPercentage);
}, [currentPosition, duration]);

  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "#e0e0e0",
        height: "8px",
        borderRadius: "4px",
      }}
    >
      <div
        style={{
          width: `${progressPercentage}%`,
          backgroundColor: "#1DB954", // Spotify's green color
          height: "100%",
          borderRadius: "4px",
        }}
      />
    </div>
  );
};

export default SongProgressBar;