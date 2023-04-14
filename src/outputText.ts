import * as path from "path";
import * as vscode from "vscode";
import { ExtensionProperties } from "./entities/extensionProperties";
import {
  logBraceString,
  logFunctionName,
  SupportLanguage,
} from "./entities/support";

function autoVarialbleLabelString(
  use: boolean,
  language: SupportLanguage,
  item: string
): string {
  if (!use || language !== "javascript") {
    return "";
  }

  const invalidStr: string[] = ["'", '"', " ", "\t", ","];

  for (const invalid of invalidStr) {
    if (item.indexOf(invalid) !== -1) {
      return "";
    }
  }

  return `${item}: `;
}

export function outputText(
  item: string,
  doc: vscode.TextDocument,
  language: SupportLanguage,
  lineNumber: number,
  properties: ExtensionProperties
): string {
  item = item.trim();

  let semicolon = "";
  if (language !== "python") {
    semicolon = properties.addSemicolonInTheEnd ? ";" : "";
  }
  const {
    logMessagePrefix,
    quote,
    useFullPath,
    useAutoVariableLabel,
    includeFileName,
    includeLineNumber,
    unityProject,
  } = properties;

  if (item.length === 0 && !logMessagePrefix) {
    throw new Error("Logging anything...");
  }

  let currentQuote = quote;
  if (language === "java" || language === "csharp") {
    // Java and csharp project is fixed to double quoted.
    currentQuote = '"';
  }

  let functionString =
    language === "csharp" && unityProject
      ? logFunctionName["unity"]
      : logFunctionName[language];

  let txt = functionString.concat(logBraceString[language][0]);

  let fl = "";
  let fileName = doc.fileName;

  if (useFullPath === false) {
    fileName = path.basename(doc.fileName);
  } else {
    // for windows file path
    fileName = fileName.replace(/\\/g, "\\\\");
  }

  if (includeFileName && includeLineNumber) {
    fl = fl.concat("[", fileName, ":", String(lineNumber), "]");
  }
  else if (includeFileName) {
    fl = fl.concat("[", fileName, "]");
  }
  else if (includeLineNumber) {
    fl = fl.concat("[:", String(lineNumber), "]");
  }

  if (item.length === 0 && logMessagePrefix) {
    return `${txt}${currentQuote}${logMessagePrefix}${fl}${currentQuote}${logBraceString[language][1]}${semicolon}`;
  }

  if (item.length > 0) {
    fl = fl.concat(
      ": ",
      autoVarialbleLabelString(useAutoVariableLabel, language, item)
    );
  }

  if (logMessagePrefix) {
    txt = `${txt}${currentQuote}${logMessagePrefix}${fl}${currentQuote}`;
    if (language === "java" || language === "csharp" || language === "dart") {
      txt = txt.concat(" + ");
    } else {
      txt = txt.concat(", ");
    }
  }

  return txt.concat(item, logBraceString[language][1], semicolon);
}
