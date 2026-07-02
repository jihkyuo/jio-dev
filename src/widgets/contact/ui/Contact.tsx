import { getProfile } from "@/entities/profile";

export function Contact() {
  const profile = getProfile();
  return (
    <section id="contact" className="scroll-mt-24">
      <h2 className="font-mono text-xs uppercase tracking-widest text-accent">
        Contact
      </h2>
      <hr className="mt-2 mb-8 border-line" />
      <p className="mb-8 text-body leading-relaxed">
        새로운 문제와 좋은 팀을 찾고 있습니다. 기회나 협업 제안이 있으시면 편하게
        연락주세요 — 이메일이 가장 빠르게 닿습니다.
      </p>
      <div className="flex flex-wrap gap-3">
        <a
          href={`mailto:${profile.links.email}`}
          className="rounded border border-accent px-4 py-2 font-mono text-sm text-accent transition-colors hover:bg-accent/10"
        >
          이메일 보내기
        </a>
        <a
          href={profile.resumePdf}
          download="프론트엔드 개발자 지오현.pdf"
          className="rounded border border-line px-4 py-2 font-mono text-sm text-muted transition-colors hover:border-accent/50 hover:text-head"
        >
          이력서 PDF ↓
        </a>
        <a
          href={profile.links.github}
          target="_blank"
          rel="noreferrer"
          className="rounded border border-line px-4 py-2 font-mono text-sm text-muted transition-colors hover:border-accent/50 hover:text-head"
        >
          GitHub ↗
        </a>
        {profile.links.linkedin && (
          <a
            href={profile.links.linkedin}
            target="_blank"
            rel="noreferrer"
            className="rounded border border-line px-4 py-2 font-mono text-sm text-muted transition-colors hover:border-accent/50 hover:text-head"
          >
            LinkedIn ↗
          </a>
        )}
      </div>
    </section>
  );
}
