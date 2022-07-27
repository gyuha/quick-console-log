
export type SupportLanguage = 'javascript' | 'python' | 'java' | 'csharp';

export const javascriptDocs = [ 
  "javascript",
  "javascriptreact",
  "typescript",
  "typescriptreact",
  "vue",
  "svelte"
];

export const supportDocs = [
  ...javascriptDocs,
  "python",
  "java",
  "csharp"
];

export function getDocType(doc: string): SupportLanguage | undefined {
  if (javascriptDocs.indexOf(doc) >= 0) {
    return 'javascript';
  }
  switch(doc) {
    case "python":
    case "java":
    case "csharp":
      return doc;
  }
  return undefined;
}

export const logFunctionName: { [k in SupportLanguage]: string } = {
  javascript: "console.log",
  python: "print",
  java: 'System.out.println',
  csharp: 'Debug.Log'
};

export const logBraceString: { [k in SupportLanguage]: string[] } = {
  javascript: ["(", ")"],
  python: ["(", ")"],
  java: ["(", ")"],
  csharp: ["(", ")"]
};

