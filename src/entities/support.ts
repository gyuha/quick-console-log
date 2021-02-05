
export type SupportLanguage = 'javascript' | 'python';

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
  return undefined;
}

export const logFunctionName: { [k in SupportLanguage]: string } = {
  javascript: "console.log",
  python: "print",
};

export const logBraceString: { [k in SupportLanguage]: string[] } = {
  javascript: ["(", ")"],
  python: ["(", ")"],
};

