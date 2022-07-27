import * as vscode from "vscode";

export type ExtensionProperties = {
  logMessagePrefix: string;
  addSemicolonInTheEnd: boolean;
  useAutoVariableLabel: boolean;
  includeFileNameAndLineNum: boolean;
  quote: string;
  useFullPath: boolean;
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
  const useAutoVariableLabel = config.useAutoVariableLabel || true;
  const useFullPath = config.useFullPath || false;
  const extensionProperties: ExtensionProperties = {
    logMessagePrefix,
    addSemicolonInTheEnd,
    quote,
    useAutoVariableLabel,
    includeFileNameAndLineNum,
    useFullPath
  };
  return extensionProperties;
}
