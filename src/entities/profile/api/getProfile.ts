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
  tagline: "변경에 강한 구조와 예측 가능한 상태 흐름. 팀이 함께 완주하는 프론트엔드 설계를 지향합니다.",
  snapshot: {
    years: 5, // 경력 4년 5개월 → "5년차" 표기. 4년차 선호 시 4로.
    domains: ["의료 AI", "모빌리티"],
    headline: "의료 AI 3개 제품 라인을 주도한 설계자 — 변경에 강한 구조로 팀 생산성을 끌어올립니다",
  },
  resumePdf: "/resume.pdf",
  links: siteConfig.links,
});

export function getProfile(): Profile {
  return profile;
}
