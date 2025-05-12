
export type SupportLanguage = 'javascript' | 'python' | 'java' | 'csharp' | 'unity'|'dart';

export const javascriptDocs = [ 
  "javascript",
  "javascriptreact",
  "svelte",
  "typescript",
  "typescriptreact",
  "astro",
  "vue",
];

export const supportDocs = [
  ...javascriptDocs,
  "csharp",
  "dart",
  "java",
  "python",
];

export function getDocType(doc: string): SupportLanguage | undefined {
  if (javascriptDocs.indexOf(doc) >= 0) {
    return 'javascript';
  }
  switch(doc) {
    case "python":
    case "java":
    case "csharp":
    case "dart":
      return doc;
  }
  return undefined;
}

export const logFunctionName: { [k in SupportLanguage]: string } = {
  csharp: 'Console.WriteLine',
  dart: 'print',
  java: 'System.out.println',
  javascript: "console.log",
  python: "print",
  unity: 'Debug.Log',
};

export const logBraceString: { [k in SupportLanguage]: string[] } = {
  csharp: ["(", ")"],
  dart: ["(", ")"],
  java: ["(", ")"],
  javascript: ["(", ")"],
  python: ["(", ")"],
  unity: ["(", ")"],
};

