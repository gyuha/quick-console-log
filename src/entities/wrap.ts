import * as vscode from "vscode";

export interface WrapData {
  txt: string;
  item: string;
  sel: vscode.Selection;
  doc: vscode.TextDocument;
  ran: vscode.Range;
  ind: string;
  idx: number;
  line: number;
  lastLine: boolean;
}

export enum Wrap {
  up,
  down,
  line,
}