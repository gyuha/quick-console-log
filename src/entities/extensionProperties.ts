import * as vscode from "vscode";

export type ExtensionProperties = {
  logMessagePrefix: string;
  addSemicolonInTheEnd: boolean;
  includeFileNameAndLineNum: boolean;
  quote: string;
};

export function getExtensionProperties() {
  const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(
    "quickConsoleLog"
  );
  const logMessagePrefix = config.logMessagePrefix
    ? config.logMessagePrefix
    : "";
  const addSemicolonInTheEnd = config.addSemicolonInTheEnd || false;
  const quote = config.quote || '"';
  const includeFileNameAndLineNum = config.includeFileNameAndLineNum || false;
  const extensionProperties: ExtensionProperties = {
    logMessagePrefix,
    addSemicolonInTheEnd,
    quote,
    includeFileNameAndLineNum,
  };
  return extensionProperties;
}
