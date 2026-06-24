import { siteConfig } from "@/config/site";

const CONTACTS = [
  { label: "Email", href: `mailto:${siteConfig.links.email}`, text: siteConfig.links.email },
  { label: "GitHub", href: siteConfig.links.github, text: "github" },
  { label: "LinkedIn", href: siteConfig.links.linkedin, text: "linkedin" },
];

export function Contact() {
  return (
    <section id="contact" className="scroll-mt-20">
      <h2 className="text-2xl font-semibold tracking-tight">연락처</h2>
      <p className="mt-4 text-foreground/75">
        제안이나 궁금한 점이 있다면 편하게 연락 주세요.
      </p>
      <ul className="mt-6 flex flex-col gap-3">
        {CONTACTS.map((contact) => (
          <li key={contact.label} className="flex items-center gap-4">
            <span className="w-20 font-mono text-sm text-foreground/50">
              {contact.label}
            </span>
            <a
              href={contact.href}
              target={contact.label === "Email" ? undefined : "_blank"}
              rel="noreferrer"
              className="text-foreground/85 underline-offset-4 hover:underline"
            >
              {contact.text}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
