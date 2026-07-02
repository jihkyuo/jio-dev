import { experienceSchema, type Experience } from "../model/schema";

/** 실제 경력으로 교체할 것. 최신순 정렬은 getExperience가 보장한다. */
const raw: Experience[] = [
  {
    company: "에이아이트릭스",
    role: "프론트엔드 개발자",
    period: { start: "2024.09", end: "NOW" },
    scope: "의료 AI 제품군 3개 라인(PRO PC·PRO WEB·B2C) 프론트 주도",
    impact: [
      "Electron 자동 업데이트를 클라우드·온프레미스 이중 체계로 구축 — 병원별 방문 설치를 업로드 한 번으로 다수 PC 일괄 업데이트",
      "서버드리븐 UI로 문진 아키텍처를 재설계해 병원·진료과별 커스텀을 프론트 배포 없이 런타임 반영",
      "세 제품이 공유하는 인체도 코어를 추상화하고 에셋을 경량화해 빌드 용량 86% 감소(21,410kB→2,959kB)",
    ],
    leadership: [
      "보일러플레이트·디자인시스템·아키텍처·코드리뷰 기준을 팀 표준으로 정립",
      "PR 템플릿·프론트엔드 컨벤션 정립으로 신규 프로젝트 착수 비용 절감",
    ],
    stack: ["Electron", "React", "TypeScript", "Zustand", "TanStack Query", "Emotion"],
  },
  {
    company: "더스윙",
    role: "프론트엔드 개발자",
    period: { start: "2022.03", end: "2024.09" },
    scope: "모빌리티 서비스 B2B 어드민·B2C 웹·웹뷰 다수 개발",
    impact: [
      "스윙 셔틀(야놀자 x 스윙) 공항 동행 예약 — 토스 결제 연동, 구글 스프레드시트 연동으로 국제화 자동화",
      "스왑 전기자전거 구독/구매 웹과 다수 운영 어드민(GPS 기기 관제·계약·정산) 개발",
      "스윙바이크 어드민 비즈니스 플로우 기획 등 PM 역할 병행, GraphQL 스키마 연동+gql 자동 생성",
    ],
    leadership: ["어드민 비즈니스 플로우 기획·화면 구성 등 제품 설계 주도"],
    stack: ["React", "TypeScript", "Vite", "Styled-component", "Naver Maps", "GraphQL"],
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
