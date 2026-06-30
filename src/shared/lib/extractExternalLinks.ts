export type ExternalLink = { url: string; text: string };

/**
 * 본문에서 외부 링크([text](http…))를 첫 등장 순서로 추출한다.
 * url 기준 dedupe(첫 등장 텍스트 유지), http/https만, 코드펜스·인라인코드 안의 URL은 제외.
 * 코드펜스 제외는 extractHeadings의 inFence 패턴을 따른다.
 * 이미지(![alt](url))는 레퍼런스가 아니므로 제외. URL 안의 균형 괄호(위키피디아식
 * `_(planet)`)는 한 단계까지 끝까지 포함한다(마크다운 링크 종결 `)`와 구분).
 */
export function extractExternalLinks(mdx: string): ExternalLink[] {
  const seen = new Set<string>();
  const out: ExternalLink[] = [];
  let inFence = false;

  for (const line of mdx.split("\n")) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    // 인라인 코드(`…`) 안의 링크는 제외 — 코드 영역을 비워 매칭에서 뺀다.
    const prose = line.replace(/`[^`]*`/g, "");
    // (!?) 이미지 플래그 · URL은 비괄호 문자 또는 균형 잡힌 (…) 한 단계까지 포함.
    for (const m of prose.matchAll(
      /(!?)\[([^\]]+)\]\((https?:\/\/(?:[^()\s]|\([^()\s]*\))*)\)/g,
    )) {
      if (m[1] === "!") continue; // 이미지 링크는 레퍼런스 아님
      const text = m[2].trim();
      const url = m[3];
      if (seen.has(url)) continue;
      seen.add(url);
      out.push({ url, text });
    }
  }
  return out;
}
