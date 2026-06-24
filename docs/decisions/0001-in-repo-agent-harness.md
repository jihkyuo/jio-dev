# 0001. 레포 내장 에이전트 하네스 도입

## Status
Accepted (2026-06-25)

## Context
jio.dev는 Claude Code로 개발하는 솔로 포트폴리오 사이트이며, 최종 완성 시 공개된다.
AI 에이전트가 일관되게 작업하도록 레포에 룰·결정기록·스펙·코드지도를 내장할 필요가 있었다.
진입 파일 후보는 둘이었다: 벤더중립 오픈 표준 AGENTS.md(Linux Foundation/AAIF 관리,
Cursor·Copilot 등이 읽음)와 Claude 전용 CLAUDE.md(Claude Code가 실제로 읽는 파일).
ADR 포맷도 Nygard(린 5섹션)와 MADR(옵션·장단점 기록) 중 선택이 필요했다.

## Decision
- 레포 내장 하네스를 도입한다: `AGENTS.md`(진입 라우터) + `docs/`(architecture·decisions·specs).
- 룰의 원본(source of truth)은 **AGENTS.md**에 두고, `CLAUDE.md`는 `@AGENTS.md` import만 한다.
- ADR 포맷은 **Nygard 린 5섹션**을 쓴다.
- 진입 파일은 progressive disclosure 원칙으로 얇게(<150줄) 유지하고, 상세는 `docs/`로 링크한다.

## Consequences
- + 멀티에이전트 호환(AGENTS.md를 읽는 모든 도구) + 표준 준수 신호.
- + `CLAUDE.md` @import로 추후 Claude 전용 지시를 덧붙일 여지를 남김.
- + Nygard는 솔로·소규모에 작성 부담이 적음.
- − Claude 전용 기능이 필요하면 `CLAUDE.md`에 별도로 둬야 함.
- − 세 결정(하네스·원본위치·포맷)을 한 ADR에 묶었으므로, 개별 재검토 시 분리가 필요할 수 있음.
