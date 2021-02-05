import * as path from "path";
import * as vscode from "vscode";
import { ExtensionProperties } from "./entities/extensionProperties";
import {
  logBraceString,
  logFunctionName,
  SupportLanguage
} from "./entities/support";

export function outputText(
  item: string,
  doc: vscode.TextDocument,
  language: SupportLanguage,
  lineNumber: number,
  properties: ExtensionProperties
): string {
  item = item.trim();
  let semicolon = '';
  if (language !== 'python') {
    semicolon = properties.addSemicolonInTheEnd ? ";" : "";
  }
  const { logMessagePrefix, quote, useFullPath } = properties;
  const fileNameAnLineNumber = properties.includeFileNameAndLineNum;

  let txt = logFunctionName[language].concat(logBraceString[language][0]);

  let fl = "";
  let fileName = doc.fileName;

  if (useFullPath === false) {
    fileName = path.basename(doc.fileName);
  } else {
    // for windows file path
    fileName = fileName.replace(/\\/g, "\\\\");
  }

  if (fileNameAnLineNumber) {
    fl = fl.concat("[", fileName, ":", String(lineNumber), "]:");
  }

  if (logMessagePrefix) {
    txt = txt.concat(quote, logMessagePrefix, fl, quote, ", ");
  }

  return txt.concat(item, logBraceString[language][1], semicolon);
}
