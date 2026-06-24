/**
 * 포트폴리오 프로젝트 목록.
 * 새 프로젝트는 이 배열에 객체 하나를 추가하면 Projects 섹션에 자동 렌더된다.
 * (블로그/MDX 없이 코드 안 데이터로만 관리하는 정적 방식)
 */
export type Project = {
  /** 카드 식별자 (key·앵커용, kebab-case) */
  slug: string;
  /** 프로젝트 이름 */
  title: string;
  /** 한 줄 요약 */
  summary: string;
  /** 사용 기술 태그 */
  tags: string[];
  /** 연도 또는 기간 (예: "2025", "2024–2025") */
  period: string;
  /** 외부 링크 (선택) — 라이브 데모·저장소 등 */
  href?: string;
};

export const projects: Project[] = [
  {
    slug: "sample-project-a",
    title: "샘플 프로젝트 A",
    summary:
      "여기에 프로젝트 한 줄 설명을 적습니다. 무엇을 풀었고 어떤 역할을 했는지.",
    tags: ["Next.js", "TypeScript", "Tailwind"],
    period: "2025",
    href: "https://example.com",
  },
  {
    slug: "sample-project-b",
    title: "샘플 프로젝트 B",
    summary: "두 번째 프로젝트 설명. href 는 선택값이라 생략할 수 있습니다.",
    tags: ["React", "Electron"],
    period: "2024",
  },
];
