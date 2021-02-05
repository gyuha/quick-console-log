import * as vscode from "vscode";
import { ExtensionProperties } from "./entities/extensionProperties";

type SupportLanguage = 'javascript' | 'python';

const javascriptDocs = [ 
  "javascript",
  "javascriptreact",
  "typescript",
  "typescriptreact",
];

const supportDocs = [
  ...javascriptDocs,
  "python",
];

const logFunctionName = {
  javascript: "console.log",
  python: "print",
};

const logBraceString = {
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
    }

    const lineNumber = ran?.start.line as number;
    const item = doc.getText(ran);

    const idx = doc.lineAt(lineNumber).firstNonWhitespaceCharacterIndex;
    const ind = doc.lineAt(lineNumber).text.substring(0, idx);
    const funcName = getSetting("functionName");
    let wrapData: WrapData = {
      txt: getSetting("functionName"),
      item,
      ran: ran as vscode.Range,
      doc,
      idx,
      ind,
      line: lineNumber,
      sel,
      lastLine: doc.lineCount - 1 === lineNumber,
    };
    const semicolon = properties.addSemicolonInTheEnd ? ";" : "";
    const { logMessagePrefix, quote } = properties;
    const fileNameAnLineNumber = properties.includeFileNameAndLineNum;

    const type = getDocType();

    if (type === "nameValue") {
      wrapData.txt =
        funcName +
        "('".concat(wrapData.item, "', ", wrapData.item, ")", semicolon);
    } else if (type === "arguments") {
      wrapData.txt =
        funcName +
        "('".concat(wrapData.item, "', ", "arguments", ")", semicolon);
    } else if (type === "get") {
      wrapData.txt = "const aaa = get(".concat(
        wrapData.item,
        ", '",
        "aaa",
        "', '')",
        semicolon
      );
    } else if (type === "return") {
      wrapData.txt = "return ".concat(wrapData.item, semicolon);
    } else if (type === "json") {
      wrapData.txt =
        funcName +
        "('".concat(
          wrapData.item,
          "', JSON.stringify(",
          wrapData.item,
          ", null, 2))",
          semicolon
        );
    } else {
      wrapData.txt = funcName + "('".concat(wrapData.item, "')", semicolon);
    }
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

function getExtensionProperties() {
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

function getDocType(doc: string): SupportLanguage | undefined {
  if (javascriptDocs.indexOf(doc) < 0) {
    return 'javascript';
  }
  if (doc === 'python') {
    return 'python';
  }
  return undefined;
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