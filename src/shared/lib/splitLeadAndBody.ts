/**
 * 케이스 스터디 본문을 첫 두 h2(`## `)를 경계로 셋으로 나눈다.
 * lead = 도입 훅(첫 h2 전) · summary = 첫 h2 섹션(요약표) · body = 둘째 h2부터 끝까지.
 * 목차를 요약표 "뒤"에 끼우기 위한 경계다 — 모바일에서 5초 페이로드(요약표)가
 * 목차 카드에 밀리지 않게 한다. 경계 판별(펜스 토글·h2 매칭)은 extractHeadings와
 * 동일 규칙이라 같은 h2들을 가리킨다 — 펜스는 `/^\s*```/` 단순 토글, h2는 공백/탭 모두 허용.
 * (긴/중첩 펜스는 둘 다의 공유 한계지만 도입부엔 펜스가 없어 무해.)
 *
 * 엣지: h2 없음 → lead·summary 빈 문자열, body=전체. h2 하나뿐 → summary가 끝까지, body 빈 문자열.
 */
export function splitLeadSummaryBody(content: string): { lead: string; summary: string; body: string } {
  const lines = content.split("\n");
  let inFence = false;
  let offset = 0;
  let firstIdx = -1;
  let secondIdx = -1;
  for (const line of lines) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    else if (!inFence && /^##\s+\S/.test(line)) {
      if (firstIdx === -1) firstIdx = offset;
      else {
        secondIdx = offset;
        break;
      }
    }
    offset += line.length + 1; // +1: split으로 사라진 \n
  }
  if (firstIdx === -1) return { lead: "", summary: "", body: content };
  const lead = content.slice(0, firstIdx);
  if (secondIdx === -1) return { lead, summary: content.slice(firstIdx), body: "" };
  return { lead, summary: content.slice(firstIdx, secondIdx), body: content.slice(secondIdx) };
}
