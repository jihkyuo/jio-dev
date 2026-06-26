import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Experience } from "@/components/Experience";
import { Skills } from "@/components/Skills";
import { Projects } from "@/components/Projects";
import { Contact } from "@/components/Contact";
import { getProfile } from "@/content";

export default function Home() {
  const p = getProfile();
  return (
    <>
      <SiteHeader />
      <main id="top" className="relative z-[1] mx-auto flex w-full max-w-2xl flex-1 flex-col gap-20 px-6 py-16">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Contact />
      </main>
      <footer className="relative z-[1] border-t border-line">
        <div className="mx-auto max-w-2xl px-6 py-8 font-mono text-xs text-muted">© {new Date().getFullYear()} {p.name}</div>
      </footer>
    </>
  );
}
