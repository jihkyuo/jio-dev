# 0002. 커밋 메시지 컨벤션: gitmoji + Conventional Commits

## Status
Accepted (2026-06-25)

## Context
레포에 확립된 커밋 규칙이 없었다(기존 커밋은 `init` 하나뿐). 일관된 이력, 향후
체인지로그·SemVer 자동화, 그리고 에이전트의 일관된 커밋을 위해 컨벤션이 필요했다.
후보 타입으로 feat/fix/patch/docs/chore를 검토했는데, `patch`는 Conventional Commits
표준 타입이 아니고 `fix`(이미 SemVer patch를 올림)와 의미가 겹치는 문제가 있었다.

## Decision
- 커밋은 **gitmoji + Conventional Commits**를 따른다. 형식 `{이모지} type: 한국어 요약`.
- 타입 5개: ✨ feat / 🐛 fix / 🩹 patch / 📝 docs / 🔧 chore.
- `patch` 모호성은 gitmoji의 구분을 차용해 해소한다: 🐛 fix = 실제 버그,
  🩹 patch = 사소한 비핵심 수정(오타·미세조정). 두 타입의 경계를 이 정의로 고정한다.
- **소프트 룰**로 운영한다(commitlint 등 훅 강제는 도입하지 않음). 솔로·에이전트 주도
  개발이라 docs 원본 + AGENTS.md 라우터 명시로 충분하다고 판단.
- 상세는 `docs/conventions/git-commits.md`, 진입 룰은 `AGENTS.md` 한 줄.

## Consequences
- + 일관된 이력 + 향후 체인지로그/SemVer 자동화 여지.
- + `patch`가 `fix`와 겹치지 않는 고유 정의를 가짐.
- + 라우터는 얇게 유지(상세는 docs로 분리).
- − 강제가 없어 사람이 수기로 어길 수 있음(필요 시 나중에 commitlint 훅 추가).
- − 이모지는 일부 터미널·commitlint 기본 설정과 추가 호환 작업이 필요할 수 있음.
