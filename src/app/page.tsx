import { Sidebar } from "@/components/Sidebar";
import { About } from "@/components/About";
import { Experience } from "@/components/Experience";
import { Skills } from "@/components/Skills";
import { Projects } from "@/components/Projects";
import { Contact } from "@/components/Contact";
import { getProfile } from "@/content";

export default function Home() {
  const p = getProfile();
  return (
    <div className="relative z-[1] mx-auto grid w-full max-w-6xl grid-cols-1 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <Sidebar />
      <div className="flex min-w-0 flex-col">
        <main className="px-6 py-10 lg:px-14">
          {/* 우측 컬럼 최상단 lead — 5초 스캔용 대표 성과 한 줄 */}
          <p className="pt-6 font-mono text-sm leading-relaxed text-accent">
            {p.snapshot.headline}
          </p>
          <About />
          <Experience />
          <Projects />
          <Skills />
          <Contact />
        </main>
        <footer className="border-t border-line px-6 py-8 lg:px-14">
          <p className="font-mono text-xs text-muted">
            © {new Date().getFullYear()} {p.name}
          </p>
        </footer>
      </div>
    </div>
  );
}
