// 인라인 링크 href를 3종으로 분류한다(MDX `a` 렌더러가 사용).
// 프래그먼트(#)=같은 글 앵커 · 절대 내부 경로(/)=같은 사이트 다른 글 · 그 외(http·mailto·tel·//·상대)=외부.
// "/로 시작" 기준이라 mailto/tel/protocol-relative가 internal로 오분류되지 않는다.
export type LinkKind = "external" | "anchor" | "internal";

export function classifyHref(href: string | undefined): LinkKind {
  const h = href ?? "";
  if (h.startsWith("#")) return "anchor";
  if (h.startsWith("//")) return "external"; // protocol-relative(//host)는 다른 사이트 — / 검사보다 먼저.
  if (h.startsWith("/")) return "internal";
  return "external";
}
