"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { useLandingAnimations } from "@/animations/use-landing-animations";
import { useRoleTransition } from "@/animations/use-role-transition";
import { useExperienceStory } from "@/animations/use-experience-story";
import { ArrowRight, ArrowUpRight, Check, Layers3, ShieldCheck, Store, ShoppingBag, Menu, X } from "lucide-react";
import { experiences, roles, type Role } from "@/lib/roles";
import { ProductPreview } from "./product-preview";

const icons = { admin: ShieldCheck, seller: Store, buyer: ShoppingBag };

function RoleExplorer() {
  const [role, setRole] = useState<Role>("admin");
  const container = useRef<HTMLDivElement>(null);
  const content = experiences[role];
  const switchRole = useRoleTransition(container, role, setRole);

  function onKeys(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % 3;
    else if (event.key === "ArrowLeft") next = (index + 2) % 3;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = 2;
    else return;
    event.preventDefault();
    container.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
    switchRole(roles[next]);
  }

  return <div ref={container} className="explorer" id="explore"><div className="explorer-top"><div><span className="eyebrow">ONE PLATFORM. YOUR PERSPECTIVE.</span><h2>Find your side of commerce.</h2></div><div className="role-tabs" role="tablist" aria-label="Explore platform roles">{roles.map((r, i) => { const Icon = icons[r]; return <button key={r} id={`tab-${r}`} role="tab" aria-selected={role === r} aria-controls="role-panel" tabIndex={role === r ? 0 : -1} onClick={() => switchRole(r)} onKeyDown={e => onKeys(e, i)}><Icon size={17} />{experiences[r].label}</button>; })}</div></div><div role="tabpanel" id="role-panel" aria-labelledby={`tab-${role}`} tabIndex={0} className="explorer-grid"><div className="role-copy role-content"><span className="role-number">0{roles.indexOf(role) + 1} / 03</span><h3>{content.title}</h3><p>{content.description}</p><ul>{content.features.map(f => <li key={f}><Check size={15} />{f}</li>)}</ul><a href="#experiences" className="text-link">A closer look <ArrowRight size={17} /></a></div><div className="role-content"><ProductPreview role={role} /></div></div></div>;
}

function ExperienceStory() {
  const scope = useRef<HTMLElement>(null);
  const [role, setRole] = useState<Role>("admin");
  useExperienceStory(scope, role, setRole);
  return <section ref={scope} id="experiences" className="story section-wrap"><div className="section-heading"><span className="eyebrow">THREE EXPERIENCES. ONE SHARED VISION.</span><h2>Built around the people<br />who make commerce happen.</h2></div><div className="story-layout"><div className="story-steps">{roles.map((r, i) => { const Icon = icons[r]; return <article className="story-step" data-story={r} key={r}><span className="step-label"><Icon size={18} />0{i + 1} — {experiences[r].label}</span><h3>{experiences[r].short}</h3><p>{experiences[r].description}</p><div className="story-tags">{experiences[r].features.slice(0, 3).map(f => <span key={f}>{f}</span>)}</div><div className="mobile-story-preview"><ProductPreview role={r} /></div></article>; })}</div><div className="story-visual"><ProductPreview role={role} /><p className="preview-caption"><span />{experiences[role].label} experience <span className="caption-right">Illustrative demo data</span></p></div></div></section>;
}

export function LandingPage() {
  const page = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  useLandingAnimations(page);

  return <div ref={page}><a href="#main" className="skip-link">Skip to content</a><header className="site-header"><a className="brand" href="#" aria-label="mintcommerce home"><span className="brand-mark"><Layers3 size={21} /></span>mintcommerce</a><nav id="mobile-navigation" className={menuOpen ? "navigation open" : "navigation"} aria-label="Main navigation"><a href="#explore" onClick={() => setMenuOpen(false)}>Platform</a><a href="#experiences" onClick={() => setMenuOpen(false)}>Experiences</a><a href="#features" onClick={() => setMenuOpen(false)}>Features</a></nav><a href="#explore" className="nav-cta">Explore platform <ArrowUpRight size={15} /></a><button className="menu-toggle" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button></header><main id="main"><section className="hero section-wrap"><div className="hero-orbit" aria-hidden="true"><div className="orbit-dot"><span /></div></div><div className="hero-reveal hero-kicker"><span /> COMMERCE, BEAUTIFULLY CONNECTED</div><h1 className="hero-reveal">Everything Your<br />Commerce Business Needs.<br /><em>In One Place.</em></h1><p className="hero-reveal hero-description">Manage your marketplace, grow your business, and enjoy seamless shopping — all through one connected platform.</p><div className="hero-reveal hero-actions"><a className="button primary" href="#explore">Explore the Platform <ArrowRight size={18} /></a><a className="button secondary" href="#features">Discover Features <ArrowUpRight size={17} /></a></div><div className="hero-reveal hero-footnote"><span>01 &nbsp; Admin</span><i /><span>02 &nbsp; Seller</span><i /><span>03 &nbsp; Buyer</span><small>One connected ecosystem.</small></div></section><section className="section-wrap explorer-section" aria-label="Interactive platform preview"><RoleExplorer /><p className="preview-note">Explore each perspective. Preview figures are illustrative; checkout is a demo.</p></section><div className="manifesto section-wrap"><span className="eyebrow">THE MINTCOMMERCE WAY</span><p>One Platform. <em>Three Experiences.</em><br />Endless Possibilities.</p><span className="manifesto-detail">A shared foundation.<br />A workspace for every role.</span></div><ExperienceStory /><section className="ecosystem-section" id="ecosystem"><div className="section-wrap ecosystem-layout"><div><span className="eyebrow">CONNECTED BY DESIGN</span><h2>Great commerce<br />is a team effort.</h2><p>One shared vision across marketplace operations, store management, and shopping. Each experience gives people the tools for their part of the journey.</p><a href="#features" className="text-link">Explore the capabilities <ArrowRight size={17} /></a></div><div className="ecosystem-visual"><svg className="ecosystem-lines" viewBox="0 0 600 360" aria-hidden="true"><path d="M300 65 L125 265 L475 265 Z" /><path className="connection-pulse" d="M300 65 L125 265 L475 265 Z" /></svg><div className="ecosystem-center"><Layers3 size={26} /><span>mintcommerce</span></div>{roles.map(r => { const Icon = icons[r]; return <div className={`ecosystem-node node-${r}`} key={r}><Icon size={22} /><b>{experiences[r].label}</b><span>{r === "admin" ? "Manages the platform" : r === "seller" ? "Manages products & sales" : "Discovers & purchases"}</span></div>; })}</div></div></section><section id="features" className="section-wrap features"><div className="section-heading"><span className="eyebrow">PURPOSEFUL TOOLS. EVERY PERSPECTIVE.</span><h2>The right tools.<br />Right where you need them.</h2><p>Explore the capabilities available in the current product experiences.</p></div><div className="feature-grid">{roles.map((r, i) => { const Icon = icons[r]; return <article className="feature-card" key={r}><div className="feature-card-top"><span className="feature-icon"><Icon size={25} /></span><small>0{i + 1}</small></div><h3>For {r === "admin" ? "marketplace teams" : r === "seller" ? "ambitious sellers" : "everyday discoveries"}</h3><p>{experiences[r].short}</p><ul>{experiences[r].features.map((f, j) => <li key={f}><span>0{j + 1}</span>{f}<Check size={15} /></li>)}</ul><a href="#explore" className="text-link">Explore {experiences[r].label.toLowerCase()} experience <ArrowUpRight size={16} /></a></article>; })}</div></section><section className="section-wrap final-cta"><span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span><h2>See the whole picture.<br /><em>Find your possibility.</em></h2><p>Three experiences. One place to bring it all together.</p><a href="#explore" className="button primary">Explore the Platform <ArrowRight size={18} /></a><span className="cta-decoration" aria-hidden="true">m</span></section></main><footer className="site-footer section-wrap"><a className="brand" href="#"><span className="brand-mark"><Layers3 size={18} /></span>mintcommerce</a><span>Thoughtfully built. Beautifully connected.</span><a href="#main">Back to top ↑</a></footer></div>;
}
