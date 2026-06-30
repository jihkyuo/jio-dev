/**
 * 케이스 스터디 본문을 첫 h2(`## `) 직전에서 둘로 나눈다.
 * lead = 도입 훅(헤드라인 칩·도입 단락 등 첫 섹션 전), body = 첫 h2부터 끝까지.
 * 그 사이에 목차를 끼우기 위한 경계. 경계 판별(펜스 토글·h2 매칭)은 extractHeadings와
 * 동일 규칙이라 둘이 같은 첫 h2를 가리킨다 — 펜스는 `/^\s*```/` 단순 토글, h2는 공백/탭 모두 허용.
 * (긴/중첩 펜스는 둘 다의 공유 한계지만 도입부엔 펜스가 없어 무해.)
 */
export function splitLeadAndBody(content: string): { lead: string; body: string } {
  const lines = content.split("\n");
  let inFence = false;
  let offset = 0;
  for (const line of lines) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    else if (!inFence && /^##\s+\S/.test(line)) {
      return offset === 0
        ? { lead: "", body: content }
        : { lead: content.slice(0, offset), body: content.slice(offset) };
    }
    offset += line.length + 1; // +1: split으로 사라진 \n
  }
  return { lead: "", body: content };
}
