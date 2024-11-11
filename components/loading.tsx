"use client";
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { getMoodClasses } from "@/utils/moodClasses";
import { MoodType } from "@/lib/types/types";

type Props = { mood?: MoodType; type?: string };

const MusicalNotes = (props: Props) => {
  const { mood, type } = props;

  const messages = [
    "Tuning into your mood...",
    "Generating your playlist...",
    "Finding the perfect tracks...",
    "Creating the vibe...",
    "Almost there...",
  ];
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const notesRef = useRef<HTMLDivElement[]>([]);
  useEffect(() => {
    if (notesRef.current) {
      gsap.fromTo(
        notesRef.current,
        { scale: 1, y: 20 },
        {
          y: 0,
          scale: 1.2,
          duration: 0.5,
          ease: "power2.inOut",
          stagger: {
            each: 0.2,
            repeat: -1,
            yoyo: true,
          },
        }
      );
    }
  }, []);

  let moodClasses;
  if (mood) {
    moodClasses = getMoodClasses(mood);
  }


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex items-center justify-center h-screen flex-col gap-5 relative inset-0 bg-gradient-to-br ${moodClasses && moodClasses.background} transition-colors duration-400`} >
      <div className="flex gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            ref={(el) => {
              if (el) notesRef.current[index] = el;
            }}
            className="text-6xl text-[#E9D5FF]"
          >
            ♪
          </div>
        ))}
      </div>
      {type == "loading" && (
        <h1 className={`z-10 font-josefin-sans text-2xl ${moodClasses && moodClasses.text}`}>
          {messages[currentMessageIndex]}
        </h1>
      )}
    </div>
  );
};

export default MusicalNotes;
