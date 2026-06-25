# 커밋 컨벤션

gitmoji + Conventional Commits를 따른다.

## 형식
`{이모지} type: 한국어 요약`

- `scope`는 선택: `{이모지} type(scope): 요약` (예: `✨ feat(projects): 카드 호버 추가`)
- 요약은 한국어·명령형·마침표 없음·50자 내외
- 본문/푸터는 선택. 필요하면 빈 줄 뒤에 "왜"를 한국어로.
- Breaking change: 요약에 `!`(`✨ feat!: ...`) 또는 푸터 `BREAKING CHANGE:`

## 타입

| 이모지 | type | 언제 | SemVer |
|---|---|---|---|
| ✨ | feat | 사용자에게 보이는 새 기능 | minor |
| 🐛 | fix | 실제 버그 / 잘못된 동작 교정 | patch |
| 🩹 | patch | 사소한 비핵심 수정(오타·미세조정, 버그까진 아닌 것) | patch |
| 📝 | docs | 문서만 변경 | — |
| 🔧 | chore | 설정·의존성·빌드·잡일(사용자 영향 없음) | — |

## 🐛 fix vs 🩹 patch 경계
- 동작이 **틀렸던 것**을 고치면 → 🐛 fix
- 동작은 멀쩡한데 **오타·문구·미세 값**만 손보면 → 🩹 patch

## 예시
- `✨ feat: 다크모드 토글 추가`
- `🐛 fix: 모바일에서 헤더 겹침 수정`
- `🩹 patch: 푸터 연도 오타 수정`
- `📝 docs: README 스택 갱신`
- `🔧 chore: next 16.2.10 범프`

## 적용
소프트 룰이다(commitlint 등 훅 강제 없음). 도입 배경은
[../decisions/0002-git-commit-convention.md](../decisions/0002-git-commit-convention.md).
