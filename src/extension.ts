import * as vscode from "vscode";
import {
  ExtensionProperties,
  getExtensionProperties
} from "./entities/extensionProperties";
import { getDocType } from "./entities/support";
import { Wrap } from "./entities/wrap";
import { outputText } from "./outputText";

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
    ),
    vscode.commands.registerTextEditorCommand(
      "quickConsoleLog.wrap.up",
      (editor, edit) => handle(Wrap.up)
    ),
    vscode.commands.registerTextEditorCommand(
      "quickConsoleLog.wrap.line",
      (editor, edit) => handle(Wrap.line)
    )
  );
}

function handle(direction: Wrap, prefix?: boolean, type?: string) {
  try {
    const doc = currentEditor.document;

    const language = getDocType(doc.languageId);

    if (language === undefined) {
      throw new Error("NO_SUPPORT_DOC");
    }

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

    const properties: ExtensionProperties = getExtensionProperties();
    // get output text
    const txt = outputText(
      item,
      doc,
      language,
      direction === Wrap.up ? lineNumber + 2 : lineNumber + 1,
      properties
    );

    // insert text
    let printLineNumber = direction === Wrap.down ? lineNumber : lineNumber - 1;
    printLineNumber = printLineNumber < 0 ? 0 : printLineNumber;

    switch (direction) {
      // down
      case Wrap.down:
        let nxtLine: vscode.TextLine;
        let nxtLineInd: string;

        if (!(doc.lineCount - 1 === lineNumber)) {
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
                doc.lineAt(printLineNumber).range.end.character
              ),
              "\n".concat(nxtLineInd > ind ? nxtLineInd : ind, txt)
            );
          })
          .then(() => {
            currentEditor.selection = sel;
          });
        break;

      // up
      case Wrap.up:
        const tLine = doc.lineAt(lineNumber === 0 ? 0 : lineNumber - 1);
        const tLineEmpty = tLine.text.trim() === "";
        let lineCorr = 0;

        currentEditor
          .edit((e) => {
              e.insert(
                new vscode.Position(lineNumber, 0),
                ind.concat(txt, "\n")
              );
          })
          .then(() => {
            let newSel = new vscode.Position(lineNumber + 1, sel.anchor.character);
            currentEditor.selection = new vscode.Selection(newSel, newSel);
          });
        break;

      //inline
      case Wrap.line:
        currentEditor
          .edit((e) => {
            e.replace(ran, txt);
          })
          .then(() => {
            currentEditor.selection = new vscode.Selection(
              new vscode.Position(
                ran.start.line,
                txt.length + ran.start.character
              ),
              new vscode.Position(
                ran.start.line,
                txt.length + ran.start.character
              )
            );
          });
        break;
    }
  } catch (message) {
    console.error("quick-console-log REJECTED_PROMISE :", message);
  }
}

export function deactivate() {
  return undefined;
}
