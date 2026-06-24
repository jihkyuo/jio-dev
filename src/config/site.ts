/**
 * 사이트 전역 설정. 메타데이터·OG 카드·연락처 등에서 단일 출처로 참조한다.
 * 배포 도메인 확정 후 url 만 맞으면 OG/메타데이터가 자동으로 따라간다.
 */
export const siteConfig = {
  name: "지오현",
  // 헤더/OG 카드 등에 쓰이는 한 줄 직함
  role: "프론트엔드 엔지니어",
  // 메타 description (검색 결과·OG 본문)
  description:
    "프론트엔드 엔지니어 지오현의 포트폴리오. 만든 것들과 연락처를 모았습니다.",
  // 배포 도메인 (metadataBase·OG 절대경로 기준). 커스텀 도메인 연결 후 그대로 유지.
  url: "https://jio.dev",
  // 연락처 — 실제 값으로 채워 넣으세요 (플레이스홀더)
  links: {
    email: "hello@jio.dev",
    github: "https://github.com/",
    linkedin: "https://www.linkedin.com/in/",
  },
} as const;

export type SiteConfig = typeof siteConfig;
