import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

const MusicalNotes: React.FC = () => {
  const notesRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (notesRef.current) {
      gsap.fromTo(
        notesRef.current,
        { scale: 1, y: 20 },
        {
          y: 0,
          scale: 1.2,
          duration: 0.3,
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

  return (
    <div className="flex items-center justify-center h-screen">
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
    </div>
  );
};

export default MusicalNotes;
