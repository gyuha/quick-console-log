import * as path from "path";
import * as vscode from "vscode";
import {
  ExtensionProperties,
  getExtensionProperties
} from "./entities/extensionProperties";
import { getDocType, SupportLanguage } from "./entities/support";
import { Wrap } from "./entities/wrap";

const logFunctionName: { [k in SupportLanguage]: string } = {
  javascript: "console.log",
  python: "print",
};

const logBraceString: { [k in SupportLanguage]: string[] } = {
  javascript: ["(", ")"],
  python: ["(", ")"],
};

let currentEditor: vscode.TextEditor;

export function activate(context: vscode.ExtensionContext) {
  currentEditor = vscode.window.activeTextEditor as vscode.TextEditor;

  vscode.window.onDidChangeActiveTextEditor(
    (editor) => (currentEditor = editor as vscode.TextEditor)
  );

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      "quickConsoleLog.wrap.down",
      (editor, edit) => handle(Wrap.down)
    )
  );
}

function handle(target: Wrap, prefix?: boolean, type?: string) {
  try {
    const doc = currentEditor.document;

    const language = getDocType(doc.languageId);

    if (language === undefined) {
      throw new Error("NO_SUPPORT_DOC");
    }

    const properties: ExtensionProperties = getExtensionProperties();
    const sel = currentEditor.selection;
    const len = sel.end.character - sel.start.character;

    const ran =
      len === 0
        ? currentEditor.document.getWordRangeAtPosition(sel.anchor)
        : new vscode.Range(sel.start, sel.end);

    if (ran === undefined) {
      throw new Error("NO_WORD");
    }

    const lineNumber = ran.start.line;
    const item = doc.getText(ran);

    const idx = doc.lineAt(lineNumber).firstNonWhitespaceCharacterIndex;
    const ind = doc.lineAt(lineNumber).text.substring(0, idx);

    const semicolon = properties.addSemicolonInTheEnd ? ";" : "";
    const { logMessagePrefix, quote, useFullPath } = properties;
    const fileNameAnLineNumber = properties.includeFileNameAndLineNum;

    let txt = logFunctionName[language].concat(logBraceString[language][0]);

    let fl = "";
    let fileName = doc.fileName;

    if (useFullPath === false) {
      fileName = path.basename(doc.fileName);
    } else {
      fileName = fileName.replace(/\\/g, "\\\\");
    }

    if (fileNameAnLineNumber) {
      fl = fl.concat("[", fileName, ":", String(lineNumber), "]:");
    }

    if (logMessagePrefix) {
      txt = txt.concat(quote, logMessagePrefix, fl, quote, ", ");
    }

    txt = txt.concat(item, logBraceString[language][1], semicolon);

    // output text
    let nxtLine: vscode.TextLine;
    let nxtLineInd: string;

    if (!(doc.lineCount -1 === lineNumber)) {
      nxtLine = doc.lineAt(lineNumber + 1);
      nxtLineInd = nxtLine.text.substring(
        0,
        nxtLine.firstNonWhitespaceCharacterIndex
      );
    } else {
      nxtLineInd = "";
    }
    currentEditor
      .edit((e) => {
        e.insert(
          new vscode.Position(
            lineNumber,
            doc.lineAt(lineNumber).range.end.character
          ),
          "\n".concat(
            nxtLineInd > ind ? nxtLineInd : ind,
            txt
          )
        );
      })
      .then(() => {
        currentEditor.selection = sel;
      });
  } catch (message) {
    console.error("quick-console-log REJECTED_PROMISE :", message);
  }
}

function getTabSize(tabSize: string | number | undefined): number {
  if (tabSize && typeof tabSize === "number") {
    return tabSize;
  } else if (tabSize && typeof tabSize === "string") {
    return parseInt(tabSize);
  } else {
    return 4;
  }
}

export function deactivate() {
  return undefined;
}
