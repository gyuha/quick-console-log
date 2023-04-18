import * as vscode from "vscode";

export type ExtensionProperties = {
  logMessagePrefix: string;
  addSemicolonInTheEnd: boolean;
  useAutoVariableLabel: boolean;
  includeFileName: boolean;
  includeLineNumber: boolean;
  quote: string;
  useFullPath: boolean;
  unityProject: boolean;
};

export function getExtensionProperties() {
  const config: vscode.WorkspaceConfiguration =
    vscode.workspace.getConfiguration("quickConsoleLog");

  const logMessagePrefix = config.logMessagePrefix || "";

  const addSemicolonInTheEnd =
    config.addSemicolonInTheEnd !== undefined
      ? config.addSemicolonInTheEnd
      : false;

  const quote = config.quote || '"';

  const includeFileName =
    config.includeFileName !== undefined
      ? config.includeFileName
      : false;

  const includeLineNumber =
    config.includeLineNumber !== undefined
      ? config.includeLineNumber
      : false;

  const useAutoVariableLabel =
    config.useAutoVariableLabel !== undefined
      ? config.useAutoVariableLabel
      : true;

  const useFullPath =
    config.useFullPath !== undefined ? config.useFullPath : false;

  const unityProject =
    config.unityProject !== undefined ? config.unityProject : true;

  const extensionProperties: ExtensionProperties = {
    logMessagePrefix,
    addSemicolonInTheEnd,
    quote,
    useAutoVariableLabel,
    includeFileName,
    includeLineNumber,
    useFullPath,
    unityProject,
  };
  return extensionProperties;
}
