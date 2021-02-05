import * as path from 'path';
import * as vscode from "vscode";
import { ExtensionProperties, getExtensionProperties } from "./entities/extensionProperties";
import { getDocType, SupportLanguage } from "./entities/support";

const logFunctionName: {[k in SupportLanguage]: string} = {
  javascript: "console.log",
  python: "print",
};

const logBraceString: {[k in SupportLanguage]: string[]} = {
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
  new Promise((resolve, reject) => {
    const doc = currentEditor.document;

    const language = getDocType(doc.languageId);

    if (language === undefined) {
      reject("NO_SUPPORT_DOC");
      return;
    }

    const properties: ExtensionProperties = getExtensionProperties();
    const sel = currentEditor.selection;
    const len = sel.end.character - sel.start.character;

    const ran =
      len === 0
        ? currentEditor.document.getWordRangeAtPosition(sel.anchor)
        : new vscode.Range(sel.start, sel.end);

    if (ran === undefined) {
      reject("NO_WORD");
      return;
    }

    const lineNumber = ran.start.line;
    const item = doc.getText(ran);

    const idx = doc.lineAt(lineNumber).firstNonWhitespaceCharacterIndex;
    const ind = doc.lineAt(lineNumber).text.substring(0, idx);

    const semicolon = properties.addSemicolonInTheEnd ? ";" : "";
    const { logMessagePrefix, quote } = properties;
    const fileNameAnLineNumber = properties.includeFileNameAndLineNum;

    let txt = logFunctionName[language].concat(logBraceString[language][0]);

    let fl = "";
    if (fileNameAnLineNumber) {
      fl = fl.concat("[", path.basename(doc.fileName), ":", String(lineNumber), "]:");
    }

    if (logMessagePrefix) {
      txt = txt.concat(quote, logMessagePrefix, fl, quote, ", ");
    }

    txt = txt.concat(item, logBraceString[language][1], semicolon);

    let wrapData: WrapData = {
      txt,
      item,
      ran: ran as vscode.Range,
      doc,
      idx,
      ind,
      line: lineNumber,
      sel,
      lastLine: doc.lineCount - 1 === lineNumber,
    };
    resolve(wrapData);
  })
    // @ts-ignore
    .then((wrap: WrapData) => {
      let nxtLine: vscode.TextLine;
      let nxtLineInd: string;

      if (!wrap.lastLine) {
        nxtLine = wrap.doc.lineAt(wrap.line + 1);
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
              wrap.line,
              wrap.doc.lineAt(wrap.line).range.end.character
            ),
            "\n".concat(nxtLineInd > wrap.ind ? nxtLineInd : wrap.ind, wrap.txt)
          );
        })
        .then(() => {
          currentEditor.selection = wrap.sel;
        });
    })
    .catch((message) => {
      console.error("quick-console-log REJECTED_PROMISE :", message);
    });
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

interface WrapData {
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

enum Wrap {
  down,
  up,
}

export function deactivate() {
  return undefined;
}