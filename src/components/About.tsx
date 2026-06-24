import { siteConfig } from "@/config/site";

export function About() {
  return (
    <section id="about" className="scroll-mt-20">
      <p className="font-mono text-sm text-foreground/60">{siteConfig.role}</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
        안녕하세요, {siteConfig.name}입니다.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground/80">
        제품을 빠르게 만들고, 디테일을 끝까지 다듬는 것을 좋아합니다. 여기에는
        그동안 만든 것들과 연락할 수 있는 방법을 모아 두었습니다.
      </p>
    </section>
  );
}
