# Quick console log

## Support language
Javascript, Javascript React, Typescript, Typescript react, Python, Java

---
## Features
This extension prints a log using the text of your cursor or the selected sentence.

In Python, `print` is used instead of `console.log`.

---
## Demo and description
### Hot key
`ctrl+alt+d`: Log output at the bottom of the sentence.
![line.gif](https://raw.githubusercontent.com/gyuha/quick-console-log/main/images/wrap-down.gif)

`ctrl+alt+u`: Log output at the up of the sentence.
![line.gif](https://raw.githubusercontent.com/gyuha/quick-console-log/main/images/wrap-up.gif)

`ctrl+alt+c`:  Log output at the current of the sentence.
![line.gif](https://raw.githubusercontent.com/gyuha/quick-console-log/main/images/wrap-line.gif)

### Snippet
`cl`: Log output by clipboard.
![snippet.gif](https://raw.githubusercontent.com/gyuha/quick-console-log/main/images/snippet.gif)


## Properties

| key                       | type    | default | description                                                  |
| ------------------------- | ------- | ------- | ------------------------------------------------------------ |
| logMessagePrefix          | string  | 📢       | The prefix of the log message.                               |
| addSemicolonInTheEnd      | boolean | true    | Whether to add or not a semicolon in the end of the log message. |
| quote                     | enum    | "       | Double quotes, single quotes or back tick                    |
| useFullPath               | boolean | false   | Use full path of file name.                                  |
| includeFileNameAndLineNum | boolean | true    | Whether to include the file name and the line number of the log message. |

