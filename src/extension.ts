import * as vscode from "vscode";
import {
  ExtensionProperties,
  getExtensionProperties,
} from "./entities/extensionProperties";
import { getDocType, javascriptDocs } from "./entities/support";
import { Wrap } from "./entities/wrap";
import { outputText } from "./outputText";

let currentEditor: vscode.TextEditor;

export function activate(context: vscode.ExtensionContext) {
  currentEditor = vscode.window.activeTextEditor as vscode.TextEditor;

  vscode.window.onDidChangeActiveTextEditor(
    (editor: any) => (currentEditor = editor as vscode.TextEditor)
  );

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      "quickConsoleLog.wrap.down",
      (editor: any, edit: any) => handle(Wrap.down)
    ),
    vscode.commands.registerTextEditorCommand(
      "quickConsoleLog.wrap.up",
      (editor: any, edit: any) => handle(Wrap.up)
    ),
    vscode.commands.registerTextEditorCommand(
      "quickConsoleLog.wrap.line",
      (editor: any, edit: any) => handle(Wrap.line)
    ),
    vscode.commands.registerTextEditorCommand(
      "quickConsoleLog.clipboard.paste",
      (editor: any, edit: any) => clipboardLog()
    ),
    vscode.commands.registerTextEditorCommand(
      "quickConsoleLog.deleteAllConsoleLogs",
      (editor: any, edit: any) => deleteAllConsoleLogs()
    ),
    vscode.commands.registerTextEditorCommand(
      "quickConsoleLog.toggleConsoleLogComments",
      (editor: any, edit: any) => toggleConsoleLogComments()
    )
  );
}

async function deleteAllConsoleLogs() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const document = editor.document;
  let languageId = document.languageId;
  const originLanguageId = languageId;
  const text = document.getText();

  // 현재 커서 위치 저장
  const currentPosition = editor.selection.active;
  const currentLine = currentPosition.line;
  const currentCharacter = currentPosition.character;

  let regex: RegExp;

  const properties: ExtensionProperties = getExtensionProperties();

  const { unityProject, logMessagePrefix } = properties;

  if (!logMessagePrefix) {
    vscode.window.showInformationMessage(
      "logMessagePrefix가 설정되어 있지 않습니다."
    );
    return;
  }

  if (javascriptDocs.includes(languageId)) {
    languageId = "javascript";
  }

  const escapedPrefix = logMessagePrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  switch (languageId) {
    case "javascript":
      regex = new RegExp(`console\\.log\\([^)]*${escapedPrefix}[^)]*\\);?`, 'g');
      break;
    case "python":
      regex = new RegExp(`print\\([^)]*${escapedPrefix}[^)]*\\)`, 'g');
      break;
    case "java":
      regex = new RegExp(`System\\.out\\.println\\([^)]*${escapedPrefix}[^)]*\\);`, 'g');
      break;
    case "csharp":
      if (unityProject) {
        regex = new RegExp(`Debug\\.Log\\([^)]*${escapedPrefix}[^)]*\\);`, 'g');
      } else {
        regex = new RegExp(`Console\\.WriteLine\\([^)]*${escapedPrefix}[^)]*\\);`, 'g');
      }
      break;
    default:
      vscode.window.showInformationMessage(
        `"${originLanguageId}" does not support log removal.`
      );
      return;
  }

  // 삭제될 로그 문의 위치를 찾습니다
  const matches: { start: number; end: number }[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push({
      start: text.substring(0, match.index).split('\n').length - 1,
      end: text.substring(0, match.index + match[0].length).split('\n').length - 1
    });
  }

  // 현재 라인 이전에 삭제될 로그 문의 수를 계산
  const deletedLinesBefore = matches.filter(m => m.start < currentLine).length;

  let newText = text.replace(regex, "");
  // Remove empty lines left after removing console.log statements
  newText = newText.replace(/^\s*[\r\n]+/gm, "");
  const matchCount = matches.length;

  await editor.edit((editBuilder) => {
    const range = new vscode.Range(
      0,
      0,
      document.lineCount,
      document.getText().length
    );
    editBuilder.replace(range, newText);
  });

  // 커서 위치 조정
  const newPosition = new vscode.Position(
    Math.max(0, currentLine - deletedLinesBefore),
    currentCharacter
  );
  editor.selection = new vscode.Selection(newPosition, newPosition);

  let logType = "console.log";
  switch (languageId) {
    case "javascript":
      logType = "console.log";
      break;
    case "python":
      logType = "print";
      break;
    case "java":
      logType = "System.out.println";
      break;
    case "csharp":
      if (unityProject) {
        logType = "Debug.Log";
      } else {
        logType = "Console.WriteLine";
      }
      break;
  }
  vscode.window.showInformationMessage(
    `Removed ${matchCount} ${logType} statements.`
  );
}

async function clipboardLog() {
  try {
    const doc = currentEditor.document;
    const language = getDocType(doc.languageId);

    if (language === undefined) {
      throw new Error("NO_SUPPORT_DOC");
    }

    const sel = currentEditor.selection;
    const lineNumber = sel.start.line;

    const properties: ExtensionProperties = getExtensionProperties();

    const clipboardText = await vscode.env.clipboard.readText();
    const txt = outputText(
      clipboardText,
      doc,
      language,
      lineNumber + 1,
      properties
    );

    const idx = doc.lineAt(lineNumber).firstNonWhitespaceCharacterIndex;
    const ind = doc.lineAt(lineNumber).text.substring(0, idx);

    currentEditor
      .edit((e: { delete: (arg0: any) => void }) => {
        e.delete(
          new vscode.Range(
            new vscode.Position(lineNumber, 0),
            new vscode.Position(
              lineNumber,
              doc.lineAt(lineNumber).range.end.character
            )
          )
        );
      })
      .then(() => {
        currentEditor.edit((e: { insert: (arg0: any, arg1: any) => void }) => {
          e.insert(new vscode.Position(lineNumber, 0), ind.concat(txt));
        });
      });
  } catch (message) {
    console.error("quick-console-log REJECTED_PROMISE :", message);
  }
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

    let ran =
      len === 0
        ? (currentEditor.document.getWordRangeAtPosition(
            sel.anchor
          ) as vscode.Range)
        : new vscode.Range(sel.start, sel.end);

    if (ran === undefined) {
      ran = new vscode.Range(sel.start, sel.end);
    }

    const lineNumber = ran.start.line;

    let item;
    if (direction === Wrap.line && len === 0) {
      item = doc.lineAt(lineNumber).text;
      ran = new vscode.Range(
        new vscode.Position(lineNumber, sel.end.character),
        new vscode.Position(lineNumber, item.length)
      ) as vscode.Range;
    } else {
      item = doc.getText(ran);
    }

    const idx = doc.lineAt(lineNumber).firstNonWhitespaceCharacterIndex;
    const ind = doc.lineAt(lineNumber).text.substring(0, idx);

    const properties: ExtensionProperties = getExtensionProperties();

    let printLineNumber = lineNumber + 1;
    if (direction === Wrap.down) {
      printLineNumber++;
    }

    // get output text
    const txt = outputText(item, doc, language, printLineNumber, properties);

    // insert text
    printLineNumber = direction === Wrap.down ? lineNumber : lineNumber - 1;
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
          .edit((e: { insert: (arg0: any, arg1: string) => void }) => {
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
        currentEditor
          .edit((e: { insert: (arg0: any, arg1: any) => void }) => {
            e.insert(new vscode.Position(lineNumber, 0), ind.concat(txt, "\n"));
          })
          .then(() => {
            let newSel = new vscode.Position(
              lineNumber + 1,
              sel.anchor.character
            );
            currentEditor.selection = new vscode.Selection(newSel, newSel);
          });
        break;

      //inline
      case Wrap.line:
        currentEditor
          .edit((e: { delete: (arg0: any) => void }) => {
            e.delete(
              new vscode.Range(
                new vscode.Position(lineNumber, 0),
                new vscode.Position(
                  lineNumber,
                  doc.lineAt(lineNumber).range.end.character
                )
              )
            );
          })
          .then(() => {
            currentEditor.edit(
              (e: { insert: (arg0: any, arg1: any) => void }) => {
                e.insert(new vscode.Position(lineNumber, 0), ind.concat(txt));
              }
            );
          });
        break;
    }
  } catch (message) {
    console.error("quick-console-log REJECTED_PROMISE :", message);
  }
}

async function toggleConsoleLogComments() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const document = editor.document;
  let languageId = document.languageId;
  const originLanguageId = languageId;

  if (javascriptDocs.includes(languageId)) {
    languageId = "javascript";
  }

  let logPattern: RegExp;
  let commentStart: string;
  let commentEnd: string = "";

  switch (languageId) {
    case "javascript":
      logPattern = /^\s*(\/\/\s*)?console\.log\(.*\);?$/;
      commentStart = "//";
      break;
    case "python":
      logPattern = /^\s*(#\s*)?print\(.*\)$/;
      commentStart = "#";
      break;
    case "java":
      logPattern = /^\s*(\/\/\s*)?System\.out\.println\(.*\);$/;
      commentStart = "//";
      break;
    case "csharp":
      const { unityProject } = getExtensionProperties();
      if (unityProject) {
        logPattern = /^\s*(\/\/\s*)?Debug\.Log\(.*\);$/;
      } else {
        logPattern = /^\s*(\/\/\s*)?Console\.WriteLine\(.*\);$/;
      }
      commentStart = "//";
      break;
    default:
      vscode.window.showInformationMessage(
        `"${originLanguageId}" does not support comment toggling.`
      );
      return;
  }

  const edits: vscode.TextEdit[] = [];
  
  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i);
    const text = line.text;

    if (logPattern.test(text)) {
      let newText: string;
      if (text.trim().startsWith(commentStart)) {
        // 주석 제거
        newText = text.replace(new RegExp(`^(\\s*)${commentStart}\\s*`), '$1');
      } else {
        // 주석 추가
        const indent = text.match(/^\s*/)?.[0] || '';
        newText = `${indent}${commentStart} ${text.trim()}`;
      }

      edits.push(new vscode.TextEdit(line.range, newText));
    }
  }

  if (edits.length > 0) {
    const workspaceEdit = new vscode.WorkspaceEdit();
    workspaceEdit.set(document.uri, edits);
    await vscode.workspace.applyEdit(workspaceEdit);
  }
}

export function deactivate() {
  return undefined;
}
