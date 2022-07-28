import * as vscode from "vscode";

export type ExtensionProperties = {
  logMessagePrefix: string;
  addSemicolonInTheEnd: boolean;
  useAutoVariableLabel: boolean;
  includeFileNameAndLineNum: boolean;
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

  const includeFileNameAndLineNum =
    config.includeFileNameAndLineNum !== undefined
      ? config.includeFileNameAndLineNum
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
    includeFileNameAndLineNum,
    useFullPath,
    unityProject,
  };
  return extensionProperties;
}
