import { experienceSchema, type Experience } from "../model/schema";

/** 실제 경력으로 교체할 것. 최신순 정렬은 getExperience가 보장한다. */
const raw: Experience[] = [
  {
    company: "某 핀테크",
    role: "프론트엔드 리드",
    period: { start: "2022.01", end: "NOW" },
    teamSize: "5명",
    scope: "결제·정산 웹 프론트 챕터 리드",
    impact: [
      "결제 위젯 리아키텍처로 번들 −38%, LCP 4.2s→1.1s, 전환 +12%",
      "렌더링 전략(SSR/스트리밍) 표준화로 초기 로딩 일관성 확보",
    ],
    leadership: ["코드 리뷰 문화·디자인 시스템 정착", "주니어 2인 멘토링"],
    stack: ["Next.js", "React", "TypeScript", "Design System"],
  },
  {
    company: "某 커머스",
    role: "프론트엔드 엔지니어",
    period: { start: "2019.03", end: "2021.12" },
    teamSize: "3명",
    scope: "상품 상세·실험 인프라 프론트",
    impact: [
      "상품 상세 성능 최적화·이미지 파이프라인 개선으로 이탈률 −9%",
      "A/B 실험 프론트 구축으로 실험 사이클 2주→3일 단축",
    ],
    leadership: ["실험 가이드 문서화"],
    stack: ["React", "Webpack", "GraphQL"],
  },
];

function rank(e: Experience): string {
  // NOW 를 가장 큰 값으로 처리해 맨 앞에 오게 한다.
  return e.period.end === "NOW" ? "9999.99" : e.period.start;
}

export function getExperience(): Experience[] {
  return raw
    .map((e) => experienceSchema.parse(e))
    .sort((a, b) => (rank(a) < rank(b) ? 1 : rank(a) > rank(b) ? -1 : 0));
}
