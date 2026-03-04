export interface ScreenRow {
  key: string;
  line: string;
  active: boolean;
}

export interface InspectorSection {
  title: string;
  lines: string[];
}

export function buildInspectorSections(sections: InspectorSection[]): string[] {
  const output: string[] = [];

  for (const section of sections) {
    if (section.lines.length === 0) {
      continue;
    }
    output.push(`## ${section.title}`);
    for (const line of section.lines) {
      output.push(`- ${line}`);
    }
    output.push("");
  }

  while (output.length > 0 && output[output.length - 1] === "") {
    output.pop();
  }

  return output;
}
