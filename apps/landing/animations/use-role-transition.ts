"use client";

import { useEffect, useRef, type RefObject } from "react";
import { gsap } from "gsap";
import type { Role } from "@/lib/roles";

export function useRoleTransition(container: RefObject<HTMLDivElement | null>, role: Role, setRole: (role: Role) => void) {
  const transition = useRef<gsap.core.Timeline | null>(null);
  const pending = useRef<Role | null>(null);
  const selected = useRef<Role>("admin");

  const switchRole = (next: Role) => {
    if (selected.current === next && pending.current === null) return;
    selected.current = next;
    pending.current = next;
    transition.current?.kill();
    const nodes = container.current?.querySelectorAll(".role-content");
    if (!nodes) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { pending.current = null; setRole(next); return; }
    transition.current = gsap.timeline().to(nodes, { autoAlpha: 0, y: -14, duration: .2, ease: "power2.in", onComplete: () => {
      pending.current = null;
      if (next === role) {
        transition.current = gsap.timeline().to(nodes, { autoAlpha: 1, y: 0, duration: .4, ease: "power3.out" });
      } else setRole(next);
    } });
  };

  useEffect(() => {
    const context = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      transition.current = gsap.timeline().fromTo(".role-content", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: .55, ease: "power3.out" }).fromTo(".preview-item", { y: 12, opacity: 0 }, { y: 0, opacity: 1, stagger: .045, duration: .4 }, "<.1");
    }, container);
    return () => { transition.current?.kill(); context.revert(); };
  }, [role]);

  return switchRole;
}
