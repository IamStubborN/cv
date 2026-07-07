export type SkillRow = {
  label: string;
  value: string;
};

export function buildSkillRows(skills: string[]): SkillRow[] {
  return skills.map((skill) => {
    const separatorIndex = skill.indexOf(":");
    if (separatorIndex === -1) {
      return { label: "", value: skill.trim() };
    }

    return {
      label: skill.slice(0, separatorIndex).trim(),
      value: skill.slice(separatorIndex + 1).trim(),
    };
  });
}
