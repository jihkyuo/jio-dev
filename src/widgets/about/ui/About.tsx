export function About() {
  return (
    <section id="about" className="scroll-mt-24 py-16">
      <h2 className="font-mono text-xs uppercase tracking-widest text-accent">
        About
      </h2>
      <hr className="mt-2 mb-8 border-line" />
      {/* 사용자가 실제 소개로 교체 */}
      <div className="space-y-4 text-body leading-relaxed">
        <p>
          복잡한 UI를 단순한 시스템으로 풀어내는 것을 좋아합니다. 사용자가
          불편함을 느끼기 전에 문제를 발견하고, 팀이 빠르게 움직일 수 있는
          구조를 만드는 데 집중합니다.
        </p>
        <p>
          결제·정산 플로우, 디자인 시스템 구축을 주로 다뤄왔습니다. 성능 수치를
          측정하고 개선하는 과정에서 제품의 전환율이 실제로 올라가는 것을 직접
          확인했습니다.
        </p>
        <p>
          새로운 문제와 좋은 팀을 찾고 있습니다. 아래 연락처로 편하게
          연락주세요.
        </p>
      </div>
    </section>
  );
}
