<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# jio.dev 에이전트 가이드

이 파일은 진입 라우터다. 상세는 `docs/`를 **필요할 때만** 읽는다.

## 항시 룰
- **Next.js**: 코드 작성 전 `node_modules/next/dist/docs/`의 관련 가이드를 읽는다(위 마커 블록).
- **패키지 매니저**: pnpm. npm/yarn 쓰지 않는다.
- **배포**: Vercel(`@vercel/analytics`·`@vercel/speed-insights` 사용). **자동 배포 미설정**(GitHub↔Vercel Git 연동 후속 예정).

## 테스트 정책 (MUST)
구현은 test-after가 아니라 test-first가 기본이다. "이번만 스킵"은 합리화 — 멈춰라.
- **순수 로직·유틸·스키마·api 변환**(Vitest 가능 영역) → **RED-first**: 명세/재현 실패 테스트를 먼저 쓰고 실패를 확인한 뒤(RED) 최소 코드로 그린. 버그·회귀 픽스도 동일(재현 테스트 먼저).
- **레이아웃·스크롤·DOM/브라우저 의존부** → 컴포넌트 테스트 하니스 없음(`@testing-library` 미도입, YAGNI). 구현 + **브라우저 수동 검증**으로 커버하고, "수동 검증으로 대체했다"는 사실을 응답에 명시한다. test-first를 건너뛴 게 아니라 해당 영역이 자동화 불가임을 밝히는 것.
- **리팩터**(동작 불변) → RED-first 대신 **기존 Vitest 스위트 그린 유지**가 검증 기준. `pnpm test`·`pnpm build` 그린으로 닫는다.
- **의미 있는 테스트만**(커버리지 채우기 금지): 테스트는 구현 디테일이 아니라 **동작·계약**을 검증한다. 한 테스트는 한 동작(이름에 "and" 있으면 분리), 이름은 동작을 서술(`test1` 금지). real code로 검증하고 **mock의 동작을 테스트하지 않는다**(mock은 불가피할 때만). 해피패스만이 아니라 **엣지·에러 경로·경계값**을 우선 커버. RED 단계에서 "기능 누락"이 아니라 오타로 실패하지 않았는지 실패 사유를 확인한다. 테스트가 과하게 복잡하면 그건 설계가 복잡하다는 신호 — 인터페이스를 단순화하라.
- 검증: `pnpm test`(전체), `pnpm content:check`(콘텐츠 스키마).

## 명령어
- `pnpm install` — 의존성 설치
- `pnpm dev` — 개발 서버
- `pnpm lint` — ESLint
- `pnpm build` — 프로덕션 빌드
- `pnpm start` — 프로덕션 서버(빌드 후 실행)

## 문서 인덱스 (필요할 때 읽기)
- 코드베이스 지도 → `docs/architecture.md`
- 결정 기록(ADR) → `docs/decisions/`
- 기능 스펙 → `docs/specs/`
- 컨벤션 → `docs/conventions/`
- **포트폴리오 콘텐츠 작성·이식** → **진입 스킬 `portfolio-next-content`**("다음 컨텐츠/글 파악·작성" 지시 시 자동 트리거 — 파이프라인 순서를 결정적으로 실행) → `docs/specs/portfolio/content-migration.md`(상세: 어디서 어떻게 옮기나) → `docs/specs/portfolio/case-study-structure.md`(글 골격: 어떻게 쓰나)

## 작업 흐름
- 새 기능: `docs/specs/<feature>/`에 spec → plan → tasks 작성 후 구현.
- 구조적 결정: `docs/decisions/`에 ADR(Nygard) 추가.
- **문서 생략**: 카피 수정·스타일 조정·1파일 픽스·의존성 범프·자명한 버그픽스는 spec/ADR 없이 진행.

## 커밋
- 형식: `{이모지} type: 한국어 요약` (gitmoji + Conventional Commits)
- 타입: ✨ feat / 🐛 fix / 🩹 patch / 📝 docs / 🔧 chore
- 예: `✨ feat: 다크모드 토글 추가`
- 상세·경계 → `docs/conventions/git-commits.md`
