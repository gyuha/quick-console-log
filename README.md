# Quick console log

## Support language
- C# for Unity
- Dart
- Java
- Javascript
- Javascript React
- Python
- Typescript
- Typescript react
- Astro

---
## Features
This extension prints a log using the text of your cursor or the selected sentence.

In Python, `print` is used instead of `console.log`.

---
## Demo and description
### Hot key
`ctrl+alt+l`: Log output at the bottom of the sentence.
![line.gif](https://raw.githubusercontent.com/gyuha/quick-console-log/main/images/wrap-down.gif)

`ctrl+alt+u`: Log output at the up of the sentence.
![line.gif](https://raw.githubusercontent.com/gyuha/quick-console-log/main/images/wrap-up.gif)


`ctrl+alt+v`:  Log output at the current by clipboard.

`ctrl+alt+shift+d`: Delete all console.log statements that contain logMessagePrefix in the current file. For example, if logMessagePrefix is "📢", only log statements containing "📢" will be deleted, other log statements will remain unchanged.

`ctrl+alt+shift+c`: Toggle comments for all console.log statements in the current file. If a log statement is not commented, it will be commented out. If it is already commented, the comment will be removed.

### Snippet
`cl`: Log output by clipboard.
![snippet.gif](https://raw.githubusercontent.com/gyuha/quick-console-log/main/images/snippet.gif)

`dl`: Log output, only Unity c#

## Properties

| key                  | type    | default | description                                                      |
| ---------------------| ------- | ------- | ---------------------------------------------------------------- |
| logMessagePrefix     | string  | 📢      | The prefix of the log message.                                   |
| addSemicolonInTheEnd | boolean | true    | Whether to add or not a semicolon in the end of the log message. |
| quote                | enum    | "       | Double quotes, single quotes or back tick                        |
| useAutoVariableLabel | boolean | true    | Use auto variable label                                          |
| useFullPath          | boolean | false   | Use full path of file name.                                      | 
| includeFileName      | boolean | true    | Whether to include the file name of the log message.             |
| includeLineNumber    | boolean | true    | Whether to include the line number of the log message.           |
| unityProject         | boolean | true    | Output Debug.Log() instead of Console.WriteLine(), only c# file  |
