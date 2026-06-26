import { siteConfig } from "@/shared/config";
import { profileSchema, type Profile } from "../model/schema";

/**
 * Hero/Contact용 프로필. 이름·링크는 siteConfig(메타데이터 단일 출처)를 재사용하고,
 * Hero 전용 카피(eyebrow·tagline·snapshot)와 이력서 경로만 여기서 정의한다.
 * 실제 PDF 파일은 `public{resumePdf}` 에 두어야 한다(별도 준비).
 */
const profile: Profile = profileSchema.parse({
  eyebrow: "Frontend Engineer",
  name: siteConfig.name,
  role: siteConfig.role,
  tagline: "복잡한 UI를 단순한 시스템으로. 성능과 DX를 함께 끌어올립니다.",
  snapshot: {
    years: 8,
    domains: ["결제·정산", "디자인 시스템"],
    headline: "대규모 결제 플로우 LCP 4.2s→1.1s · 전환 +12%",
  },
  resumePdf: "/resume.pdf",
  links: siteConfig.links,
});

export function getProfile(): Profile {
  return profile;
}
