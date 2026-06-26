import { defineConfig } from "steiger";
import fsd from "@feature-sliced/steiger-plugin";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    rules: {
      // 30-file 포트폴리오에서는 엔티티 1:1 대응이 정상 — "참조 부족" 오탐 억제
      "fsd/insignificant-slice": "off",
      // 슬라이스 수가 적어 "슬라이스 과다" 경고는 무의미 — 소규모 프로젝트 노이즈
      "fsd/excessive-slicing": "off",
    },
  },
]);
