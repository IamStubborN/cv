import { describe, expect, test } from "vitest";
import { buildSkillRows } from "../src/pdf/skills.js";

describe("buildSkillRows", () => {
  test("splits category-prefixed skills into label and value rows", () => {
    expect(
      buildSkillRows([
        "Languages: Go, Rust, JavaScript",
        "Backend: REST, gRPC, Huma",
      ]),
    ).toEqual([
      { label: "Languages", value: "Go, Rust, JavaScript" },
      { label: "Backend", value: "REST, gRPC, Huma" },
    ]);
  });

  test("keeps uncategorized skill strings readable", () => {
    expect(buildSkillRows(["Go", "PostgreSQL"])).toEqual([
      { label: "", value: "Go" },
      { label: "", value: "PostgreSQL" },
    ]);
  });
});
