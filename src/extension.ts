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

  // 현재 커서 위치 저장
  const currentPosition = editor.selection.active;
  const currentLine = currentPosition.line;
  const currentCharacter = currentPosition.character;

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

  let logPattern: RegExp;
  let commentedLogPattern: RegExp;

  switch (languageId) {
    case "javascript":
      // 일반 로그 패턴과 주석 처리된 로그 패턴
      logPattern = new RegExp(`console\\.log\\([^)]*${escapedPrefix}[^)]*\\);?`);
      commentedLogPattern = new RegExp(`^\s*//.*console\\.log\\([^)]*${escapedPrefix}[^)]*\\);?`);
      break;
    case "python":
      logPattern = new RegExp(`print\\([^)]*${escapedPrefix}[^)]*\\)`);
      commentedLogPattern = new RegExp(`^\s*#.*print\\([^)]*${escapedPrefix}[^)]*\\)`);
      break;
    case "java":
      logPattern = new RegExp(`System\\.out\\.println\\([^)]*${escapedPrefix}[^)]*\\);`);
      commentedLogPattern = new RegExp(`^\s*//.*System\\.out\\.println\\([^)]*${escapedPrefix}[^)]*\\);`);
      break;
    case "csharp":
      if (unityProject) {
        logPattern = new RegExp(`Debug\\.Log\\([^)]*${escapedPrefix}[^)]*\\);`);
        commentedLogPattern = new RegExp(`^\s*//.*Debug\\.Log\\([^)]*${escapedPrefix}[^)]*\\);`);
      } else {
        logPattern = new RegExp(`Console\\.WriteLine\\([^)]*${escapedPrefix}[^)]*\\);`);
        commentedLogPattern = new RegExp(`^\s*//.*Console\\.WriteLine\\([^)]*${escapedPrefix}[^)]*\\);`);
      }
      break;
    default:
      vscode.window.showInformationMessage(
        `"${originLanguageId}" does not support log removal.`
      );
      return;
  }

  // 삭제할 라인들을 찾습니다 (일반 로그와 주석 처리된 로그 모두)
  const linesToDelete: number[] = [];
  
  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i);
    // 공백 줄은 건너뜁니다
    if (line.isEmptyOrWhitespace) {
      continue;
    }
    // 일반 로그 또는 주석 처리된 로그 확인
    if (logPattern.test(line.text) || commentedLogPattern.test(line.text)) {
      linesToDelete.push(i);
    }
  }

  // 커서 위치를 조정하기 위해 삭제될 라인 중 현재 라인 이전에 있는 라인 수 계산
  const deletedLinesBefore = linesToDelete.filter(line => line < currentLine).length;
  
  // 역순으로 삭제해야 인덱스가 변경되지 않습니다
  const edits = linesToDelete.reverse().map(lineNumber => {
    const range = document.lineAt(lineNumber).rangeIncludingLineBreak;
    return vscode.TextEdit.delete(range);
  });

  const workspaceEdit = new vscode.WorkspaceEdit();
  workspaceEdit.set(document.uri, edits);
  
  // 삭제 실행
  await vscode.workspace.applyEdit(workspaceEdit);

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
    `Removed ${linesToDelete.length} ${logType} statements.`
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
