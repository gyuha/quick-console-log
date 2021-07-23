
export type SupportLanguage = 'javascript' | 'python' | 'java';

export const javascriptDocs = [ 
  "javascript",
  "javascriptreact",
  "typescript",
  "typescriptreact",
];

export const supportDocs = [
  ...javascriptDocs,
  "python",
];

export function getDocType(doc: string): SupportLanguage | undefined {
  if (javascriptDocs.indexOf(doc) >= 0) {
    return 'javascript';
  }
  if (doc === 'python') {
    return 'python';
  }
  if (doc === 'java') {
    return 'java';
  }
  return undefined;
}

export const logFunctionName: { [k in SupportLanguage]: string } = {
  javascript: "console.log",
  python: "print",
  java: 'System.out.println'
};

export const logBraceString: { [k in SupportLanguage]: string[] } = {
  javascript: ["(", ")"],
  python: ["(", ")"],
  java: ["(", ")"],
};

