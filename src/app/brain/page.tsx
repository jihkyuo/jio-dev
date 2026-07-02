import type { Metadata } from "next";
import { BrainGraphClient } from "./BrainGraphClient";

export const metadata: Metadata = {
  title: "Brain",
  description: "지식 그래프 — Second Brain 공개 표면",
};

export default function BrainPage() {
  return <BrainGraphClient />;
}
