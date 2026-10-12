"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { roles, type Role } from "@/lib/roles";

export function useExperienceStory(scope: RefObject<HTMLElement | null>, role: Role, setRole: (role: Role) => void) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      const media = gsap.matchMedia();
      media.add("(min-width: 1000px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.to(".story-visual", { scrollTrigger: { trigger: ".story-layout", start: "top 120px", end: "bottom bottom", pin: ".story-visual", pinSpacing: false } });
        roles.forEach(r => ScrollTrigger.create({ trigger: `[data-story="${r}"]`, start: "top 55%", end: "bottom 55%", onEnter: () => setRole(r), onEnterBack: () => setRole(r) }));
      });
      return () => media.revert();
    }, scope);
    return () => context.revert();
  }, [scope, setRole]);
  useEffect(() => {
    const context = gsap.context(() => {
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) gsap.fromTo(".story-visual .product-window", { opacity: .3, y: 15 }, { opacity: 1, y: 0, duration: .65, ease: "power3.out" });
    }, scope);
    return () => context.revert();
  }, [scope, role]);
}
