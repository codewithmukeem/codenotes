<div align="center">

```
  ██████╗ ██████╗ ██████╗ ███████╗███╗   ██╗ ██████╗ ████████╗███████╗███████╗
 ██╔════╝██╔═══██╗██╔══██╗██╔════╝████╗  ██║██╔═══██╗╚══██╔══╝██╔════╝██╔════╝
 ██║     ██║   ██║██║  ██║█████╗  ██╔██╗ ██║██║   ██║   ██║   █████╗  ███████╗
 ██║     ██║   ██║██║  ██║██╔══╝  ██║╚██╗██║██║   ██║   ██║   ██╔══╝  ╚════██║
 ╚██████╗╚██████╔╝██████╔╝███████╗██║ ╚████║╚██████╔╝   ██║   ███████╗███████║
  ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝ ╚═════╝   ╚═╝   ╚══════╝╚══════╝
```

**Write Better Code. Save Better Ideas.**

A premium, offline-first developer note-taking app built with Expo & React Native.

[![MIT License](https://img.shields.io/badge/License-MIT-black.svg)](LICENSE)
[![Expo](https://img.shields.io/badge/Expo-54.0-black.svg)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-black.svg)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-black.svg)](https://typescriptlang.org)
[![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-black.svg)](#)

</div>

---

## Overview

**CodeNotes** is a flagship, portfolio-quality mobile application for developers who think in code and write in markdown. Every note lives entirely on your device — no accounts, no cloud, no internet required. It combines the minimal aesthetics of Notion and Linear with the syntax awareness of VS Code.

---

## Features

### ✦ Core
- **Offline-first** — all data stored locally via AsyncStorage, zero backend
- **Markdown rendering** — custom parser with full block/inline support
- **Syntax highlighting** — 15 languages with VS Code color tokens (light & dark)
- **Auto-save** — 800ms debounce, no manual save needed

### ✦ Organization
- **Collections** — group notes into named folders with icons
- **Tags** — freeform tagging across all notes
- **Favorites & Pinning** — surface important notes instantly
- **Archive & Trash** — soft-delete workflow with restore support

### ✦ Editor
- **Edit / Preview toggle** — switch between raw markdown and rendered output
- **Language picker** — 15 languages: JS, TS, Python, Java, C, C++, SQL, Bash, HTML, CSS, JSON, YAML, XML, Markdown, Plaintext
- **Word count, character count, reading time** — live bottom bar
- **Copy code button** — one-tap clipboard copy on any code block

### ✦ Appearance
- **Dark / Light / System** theme — premium monochrome design
- **Font size** — Small, Medium, Large
- **iOS 26 Liquid Glass tabs** — native NativeTabs with ClassicTabs fallback
- **Blur tab bar** on iOS, solid on Android/Web

### ✦ Search
- **Full-text search** — across titles, content, and tags
- **Dedicated search screen** — instant results as you type

---

## Screenshots

> _Run the app locally to see it in action._

| Home | Note Editor | Preview | Collections |
|------|------------|---------|-------------|
| Notes list with pinned, favorites & recent sections | Full-screen editor with auto-save | Rendered Markdown + syntax-highlighted code blocks | Folder-style collection management |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Expo](https://expo.dev) ~54 / [React Native](https://reactnative.dev) 0.81 |
| Language | TypeScript 5.9 (strict) |
| Navigation | [Expo Router](https://expo.github.io/router) v6 (file-based) |
| Storage | [@react-native-async-storage/async-storage](https://github.com/react-native-async-storage/async-storage) |
| Fonts | Inter (Regular, Medium, SemiBold, Bold) via `@expo-google-fonts` |
| Icons | `@expo/vector-icons` (Feather set) + `expo-symbols` (SF Symbols on iOS) |
| Animations | `react-native-reanimated` 4 |
| Gestures | `react-native-gesture-handler` |
| Haptics | `expo-haptics` |
| Clipboard | `expo-clipboard` |
| Tabs (iOS 26) | `expo-router/unstable-native-tabs` + `expo-glass-effect` |
| Markdown | Custom block/inline parser (zero dependencies) |
| Syntax Highlight | Custom tokenizer (zero dependencies) |

---

## Project Structure

```
artifacts/mobile/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx        # NativeTabs (iOS 26) + ClassicTabs fallback
│   │   ├── index.tsx          # Home — pinned, favorites, recent
│   │   ├── search.tsx         # Full-text search
│   │   ├── collections.tsx    # Collections + create modal
│   │   ├── archive.tsx        # Archive & Trash sub-tabs
│   │   └── settings.tsx       # Theme, font size, storage stats
│   ├── note/
│   │   └── [id].tsx           # Note editor — edit/preview, auto-save
│   ├── _layout.tsx            # Root layout — providers, fonts, splash
│   └── +not-found.tsx         # 404 fallback
│
├── components/
│   ├── CodeBlock.tsx          # Syntax highlighter with line numbers & copy
│   ├── CollectionCard.tsx     # Animated collection card
│   ├── EmptyState.tsx         # Icon + title + subtitle placeholder
│   ├── ErrorBoundary.tsx      # React error boundary
│   ├── FAB.tsx                # Floating action button
│   ├── MarkdownRenderer.tsx   # Block & inline Markdown parser
│   ├── NoteCard.tsx           # Animated note card with badges
│   ├── SearchBar.tsx          # Cross-platform search input
│   └── TagPill.tsx            # Tag chip with selected state
│
├── constants/
│   ├── colors.ts              # Full light + dark monochrome token sets
│   └── languages.ts           # 15-language definitions
│
├── context/
│   ├── NotesContext.tsx       # Notes + collections CRUD state
│   └── SettingsContext.tsx    # Theme + font-size global state
│
├── hooks/
│   └── useColors.ts           # Theme-aware color hook
│
├── storage/
│   ├── notes.ts               # AsyncStorage CRUD — @codenotes:notes_v1
│   ├── collections.ts         # AsyncStorage CRUD — collections
│   └── settings.ts            # AsyncStorage settings persistence
│
├── types/
│   └── index.ts               # Note, Collection, AppSettings, Language types
│
├── utils/
│   └── noteUtils.ts           # ID generation, word/char/reading-time, formatRelativeTime
│
└── app.json                   # Expo config — bundle IDs, splash, plugins
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 20+
- [pnpm](https://pnpm.io) 9+
- [Expo Go](https://expo.dev/go) on your iOS or Android device, OR a simulator

### Installation

```bash
# Clone the repository
git clone https://github.com/codewithmukeem/codenotes.git
cd codenotes

# Install dependencies
pnpm install

# Start the Expo development server
pnpm --filter @workspace/mobile run dev
```

Then scan the QR code with **Expo Go** on your device, or press `i` for iOS simulator / `a` for Android emulator.

### Web Preview

The app also runs in the browser:

```bash
# Open http://localhost:<PORT> after starting the dev server
pnpm --filter @workspace/mobile run dev
# Press w to open in browser
```

---

## Supported Languages

Syntax highlighting is provided for:

| Language | Extension |
|----------|-----------|
| JavaScript | `.js` |
| TypeScript | `.ts` |
| Python | `.py` |
| Java | `.java` |
| C | `.c` |
| C++ | `.cpp` |
| SQL | `.sql` |
| Bash | `.sh` |
| HTML | `.html` |
| CSS | `.css` |
| JSON | `.json` |
| YAML | `.yaml` |
| XML | `.xml` |
| Markdown | `.md` |
| Plaintext | `.txt` |

---

## Data Storage

All data is stored locally using AsyncStorage with the following keys:

| Key | Contents |
|-----|----------|
| `@codenotes:notes_v1` | All notes (array of `Note` objects) |
| `@codenotes:collections_v1` | All collections |
| `@codenotes:settings_v1` | User preferences (theme, font size) |

No data ever leaves your device.

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a pull request.

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a complete history of releases.

---

## License

[MIT](LICENSE) © 2024 Mukeem Javaid — [Code With Mukeem](https://github.com/codewithmukeem)

---

<div align="center">
  <sub>Built with ♥ by <a href="https://github.com/codewithmukeem">Mukeem Javaid</a></sub>
</div>
