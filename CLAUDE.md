# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a VS Code extension called "Quick console log" that helps developers insert log statements efficiently. The extension supports multiple programming languages including JavaScript/TypeScript, Python, Java, C#, Dart, and Astro.

## Common Development Commands

### Build and Development
- `npm run compile` - Compile TypeScript to JavaScript
- `npm run watch` - Watch mode for development (recompiles on changes)
- `npm run vscode:prepublish` - Prepare for publishing (runs compile)

### Testing and Quality
- `npm run test` - Run tests (compiles first, then runs)
- `npm run pretest` - Prepare for testing (compile + lint)
- `npm run lint` - Run ESLint on src directory

### Publishing
- `npm run packaging` - Create VSIX package using vsce
- `npm run publish` - Publish to VS Code marketplace

## Architecture

### Core Structure
- `src/extension.ts` - Main entry point that registers commands and handles activation
- `src/entities/` - Core business logic
  - `extensionProperties.ts` - Configuration management and settings
  - `support.ts` - Language support definitions
  - `wrap.ts` - Text wrapping logic (up/down/line positioning)
- `src/outputText.ts` - Log statement formatting and generation
- `snippets/` - Code snippets for different languages

### Key Features
The extension provides several commands:
- `quickConsoleLog.wrap.down` - Insert log below current line (Ctrl+Alt+D)
- `quickConsoleLog.wrap.up` - Insert log above current line (Ctrl+Alt+U)
- `quickConsoleLog.wrap.line` - Replace current line with log (Ctrl+Alt+C)
- `quickConsoleLog.clipboard.paste` - Log clipboard content (Ctrl+Alt+V)
- `quickConsoleLog.deleteAllConsoleLogs` - Delete logs with prefix (Ctrl+Alt+Shift+D)
- `quickConsoleLog.toggleConsoleLogComments` - Toggle log comments (Ctrl+Alt+Shift+C)

### Language Support
The extension supports different log statements per language:
- JavaScript/TypeScript/Astro: `console.log()`
- Python: `print()`
- Java: `System.out.println()`
- C#: `Debug.Log()` (Unity) or `Console.WriteLine()`

### Configuration System
Settings are managed through VS Code workspace configuration with prefix `quickConsoleLog`:
- `logMessagePrefix` - Prefix for log messages (default: "📢")
- `addSemicolonInTheEnd` - Add semicolon to logs
- `quote` - Quote type (", ', or `)
- `useAutoVariableLabel` - Auto include variable labels
- `includeFileName/includeLineNumber` - Include file/line info
- `unityProject` - Use Unity-specific C# logging

## Development Notes

### TypeScript Configuration
- Target: ES6
- Module: CommonJS
- Output directory: `out/`
- Strict mode enabled

### Testing
Tests are located in `src/test/` and use the VS Code test runner. The extension includes integration tests for core functionality.

### Language Detection
The extension uses `getDocType()` from `src/entities/support.ts` to determine language-specific behavior. JavaScript variants (JS, TS, JSX, TSX, Astro) are normalized to "javascript" for processing.