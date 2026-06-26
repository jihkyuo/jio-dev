<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# jio.dev 에이전트 가이드

이 파일은 진입 라우터다. 상세는 `docs/`를 **필요할 때만** 읽는다.

## 항시 룰
- **Next.js**: 코드 작성 전 `node_modules/next/dist/docs/`의 관련 가이드를 읽는다(위 마커 블록).
- **패키지 매니저**: pnpm. npm/yarn 쓰지 않는다.
- **배포**: Vercel(`@vercel/analytics`·`@vercel/speed-insights` 사용). git 푸시 시 자동 배포.

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

## 작업 흐름
- 새 기능: `docs/specs/<feature>/`에 spec → plan → tasks 작성 후 구현.
- 구조적 결정: `docs/decisions/`에 ADR(Nygard) 추가.
- **문서 생략**: 카피 수정·스타일 조정·1파일 픽스·의존성 범프·자명한 버그픽스는 spec/ADR 없이 진행.

## 커밋
- 형식: `{이모지} type: 한국어 요약` (gitmoji + Conventional Commits)
- 타입: ✨ feat / 🐛 fix / 🩹 patch / 📝 docs / 🔧 chore
- 예: `✨ feat: 다크모드 토글 추가`
- 상세·경계 → `docs/conventions/git-commits.md`
