"use client";

import { useEffect, useRef, useState } from "react";

type ScrollDirection = "up" | "down" | "idle";

export function useScrollDirection() {
  const lastScrollY = useRef(0);
  const [direction, setDirection] = useState<ScrollDirection>("idle");

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current) {
        setDirection("down");
      } else if (currentScrollY < lastScrollY.current) {
        setDirection("up");
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return direction;
}
