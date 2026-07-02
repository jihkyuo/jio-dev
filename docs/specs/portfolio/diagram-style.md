# 케이스 스터디 다이어그램 — 스타일·안전 규율

> [`case-study-structure.md`](./case-study-structure.md) §4.6의 부속 정본. **언제 그리나**는 §4.6(figure thesis 킬룰)이 지배하고, 이 문서는 **어떻게 그리나**(비주얼·네이밍·안전)를 못박는다. 자동 강제는 `src/entities/project/api/content-guardrail.test.ts`(R3).
>
> 목적: 손으로(LLM 포함) 그려도 **글마다 시각 엔트로피가 없게** 한다. 스크린샷은 보안상 금지 — 개념도만.

## 1. 매체·기술

- **SVG만.** 래스터(.png/.jpg) 금지. 크리스프·다크대응·git diff·경량.
- 파일: `public/projects/<slug>-<개념>.svg` (예: `immutable-form-tree-structural-sharing.svg`).
- 본문 삽입: 마크다운 이미지 한 줄 `![캡션 문장](/projects/<slug>-<개념>.svg)`. **캡션(alt)이 곧 figcaption** — 그림이 무엇을 보이는지 한 문장으로.
- 렌더: `src/shared/ui/mdx.tsx`의 `img → figure` 핸들러가 라운드·보더·중앙·캡션을 입힌다(img alt는 비우고 figcaption이 설명 — 스크린리더 중복 방지).

## 2. 색 토큰 — hex 하드코딩 (★중요)

**외부 SVG는 페이지 CSS 변수(`var(--accent)`)를 상속하지 못한다.** 반드시 아래 hex를 그대로 박는다(사이트 다크 테마 기준, `src/app/globals.css` `:root`와 동기).

| 역할 | hex | 용도 |
|---|---|---|
| bg | `#101216` | 캔버스(투명 배경 위 카드) |
| card | `#15181e` | 도형 카드 배경 |
| line | `#1e222a` | 카드 테두리 |
| head | `#f1f3f6` | 강한 텍스트 |
| body | `#b7bdc8` | 캡션·본문 텍스트 |
| muted | `#7e8593` | 보조 라벨·"옛/공유" 요소 |
| accent | `#7e9cd4` | 강조("새/변경/핵심") 노드·엣지 |

- 규칙: **accent = "바뀐 것/핵심", muted = "그대로/배경".** 색이 의미를 나른다.
- 강조 노드: `fill="#7e9cd4"`(진하게) 또는 `fill="#7e9cd4" fill-opacity="0.16" stroke="#7e9cd4"`(에디토리얼). 텍스트는 `#8fb0ec`(밝은 accent) 또는 `#101216`(진한 fill 위).

## 3. 비주얼 스타일 — 에디토리얼

- **원·박스 + 얇은 선**(stroke 1.5~1.8). 요란한 박스 다이어그램보다 조용·정제.
- viewBox 대략 `0 0 640 330`(가로 도형). 폰트 `ui-sans-serif, system-ui, 'Apple SD Gothic Neo'`, 라벨 12~15px.
- 상단에 mono 소제목(편집/맥락 라벨), 하단에 한 줄 요지 또는 범례.
- `_diagram-template.svg`(같은 폴더 아님 — `public/projects/_diagram-template.svg`)를 복붙 출발점으로.

## 4. 안전 (guardrail R3가 자동 차단)

SVG 안에 아래가 있으면 `content:check` 실패:
- `<script>` · `<foreignObject>` · 외부 `href`(http/https) · 래스터 `<image>`.
순수 벡터(rect·circle·path·line·text·폴리곤)만. 인터랙션·외부 리소스 없음.

## 5. 승인 예제 / 금지 예제

**✅ 승인**: `content/projects/immutable-form-tree.mdx`의 구조적 공유 도형(`immutable-form-tree-structural-sharing.svg`). thesis="편집된 노드+조상만 새 객체, 형제는 옛 객체 공유" — 실제 구조와 일치, accent/muted가 의미를 나름.

**❌ 금지**(§4.6 reject 재확인):
- PAAR 표를 그림으로 재진술.
- 리스트·타임라인을 박스+화살표로(정보 0).
- 없는 모듈 경계를 지어낸 "아키텍처 극장".
- 실제 델타가 "코드 깔끔"뿐인 전/후.
- 실제 의존·데이터흐름·상태전이·소유경계로 **추적 안 되는 화살표**.

## 6. 체크(그리기 전/후)

1. figure thesis 한 문장이 나오나? 안 나오면 그리지 마라(§4.6).
2. 모든 화살표·노드가 §9.1 원자료(확실성 [확정]/[일반화])로 추적되나?
3. 토큰 hex만 썼나? accent=변경/muted=배경 규칙을 지켰나?
4. `pnpm content:check`(R3) 통과 — 경로 `/projects/<slug>-…svg`·존재·SVG 안전.
