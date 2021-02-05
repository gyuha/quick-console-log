# Quick console log

## Support language
Javascript, Javascript React, Typescript, Typescript react, Python

---
## Features
This extension prints a log using the text of your cursor or the selected sentence.

In Python, `print` is used instead of `console.log`.

---
## Demo and description
### Hot key
`ctrl+alt+d`: Log output at the bottom of the sentence.
![line.gif](https://github.com/gyuha/quick-console-log/blob/main/images/wrap-down.gif?raw=true)

`ctrl+alt+u`: Log output at the up of the sentence.
![line.gif](https://github.com/gyuha/quick-console-log/blob/main/images/wrap-up.gif?raw=true)

`ctrl+alt+c`:  Log output at the current of the sentence.
![line.gif](https://github.com/gyuha/quick-console-log/blob/main/images/wrap-line.gif?raw=true)

### Snippet
`cl`: Log output by clipboard.
![snippet.gif](https://github.com/gyuha/quick-console-log/blob/main/images/snippet.gif?raw=true)


## Properties

| key                       | type    | default | description                                                  |
| ------------------------- | ------- | ------- | ------------------------------------------------------------ |
| logMessagePrefix          | string  | 📢       | The prefix of the log message.                               |
| addSemicolonInTheEnd      | boolean | true    | Whether to add or not a semicolon in the end of the log message. |
| quote                     | enum    | "       | Double quotes, single quotes or back tick                    |
| useFullPath               | boolean | false   | Use full path of file name.                                  |
| includeFileNameAndLineNum | boolean | true    | Whether to include the file name and the line number of the log message. |

