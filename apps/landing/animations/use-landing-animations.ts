"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function useLandingAnimations(page: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hero-reveal", { y: 35, opacity: 0, duration: 1, stagger: .12, ease: "power3.out" });
        gsap.from(".hero-orbit", { scale: .8, opacity: 0, duration: 1.6, ease: "power2.out" });
        gsap.to(".orbit-dot", { rotation: 360, transformOrigin: "50% 50%", repeat: -1, duration: 35, ease: "none" });
        gsap.utils.toArray<HTMLElement>(".feature-card, .ecosystem-node").forEach(el => gsap.from(el, { y: 28, opacity: 0, duration: .65, scrollTrigger: { trigger: el, start: "top 90%", once: true } }));
        gsap.to(".connection-pulse", { strokeDashoffset: -100, repeat: -1, duration: 5, ease: "none" });
      });
      return () => media.revert();
    }, page);
    return () => context.revert();
  }, [page]);

}
