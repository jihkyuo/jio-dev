import { SiteHeader } from "@/components/SiteHeader";
import { About } from "@/components/About";
import { Projects } from "@/components/Projects";
import { Contact } from "@/components/Contact";
import { siteConfig } from "@/config/site";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main
        id="top"
        className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-24 px-6 py-20"
      >
        <About />
        <Projects />
        <Contact />
      </main>
      <footer className="border-t border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-3xl px-6 py-8 font-mono text-sm text-foreground/50">
          © {siteConfig.name}
        </div>
      </footer>
    </>
  );
}
