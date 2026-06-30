"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

// 케이스 스터디에서 빠져나가는 유일한 동선. <Link>의 기본 push는 history tip에
// 새 엔트리를 쌓아, "돌아가기" 후 브라우저 뒤로가기를 누르면 글로 되돌아오는
// 함정을 만든다. 그래서 앱 내부에서 들어왔으면 진짜 router.back()으로 보내
// 홈의 스크롤 위치까지 복원하고, 직접 진입(새 탭·외부 링크·새로고침)이라
// 되돌아갈 엔트리가 없을 때만 /#projects로 push 폴백한다.
export function BackLink() {
  const router = useRouter();
  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // 새 탭/수정키 클릭은 브라우저 기본 동작(href로 열기)을 그대로 둔다.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    if (window.history.length > 1) router.back();
    else router.push("/#projects");
  };
  // 박스 없는 조용한 chrome. 제목만 chrome가 제공한다는 페이지 철학에 맞춰
  // muted로 물러나 있다가 hover시 accent로 살아난다.
  return (
    <Link
      href="/#projects"
      onClick={onClick}
      className="group mb-10 inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-accent"
    >
      <span aria-hidden className="transition-transform group-hover:-translate-x-0.5">
        ←
      </span>
      돌아가기
    </Link>
  );
}
