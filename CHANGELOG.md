# Changelog

All notable changes to **CodeNotes** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2024-08-04

### Added

#### Core App
- Offline-first architecture — all data persisted via AsyncStorage, no backend required
- Full Expo Router v6 file-based navigation with typed routes
- Root layout with `SettingsProvider`, `NotesProvider`, `ErrorBoundary`, gesture handler, keyboard controller, and safe area provider
- Inter font family (Regular, Medium, SemiBold, Bold) via `@expo-google-fonts/inter`
- Expo splash screen with white background and auto-hide on font load

#### Navigation
- 5-tab navigation: **Notes**, **Search**, **Collections**, **Archive**, **Settings**
- iOS 26 Liquid Glass `NativeTabs` with automatic `ClassicTabs` fallback
- Blur tab bar on iOS (transparent + BlurView), solid on Android/Web
- Full-screen Note Editor as a Stack screen at `/note/[id]`

#### Home Screen
- Pinned notes section
- Favorites section (excluding pinned)
- Recent notes section (up to 30)
- Inline search with live results
- Header quick-compose button
- Animated floating action button (FAB)

#### Note Editor (`/note/[id]`)
- Edit / Preview mode toggle
- Auto-save with 800ms debounce and "Saved" indicator
- Title input and multi-line content input
- Language picker modal (bottom sheet, 15 languages)
- Pin and Favorite toggles in top bar
- More menu: Archive, Duplicate, Delete (with confirmation)
- Empty note auto-deleted on back navigation
- Bottom status bar: word count, character count, reading time

#### Markdown Renderer
- Custom zero-dependency block parser: headings (h1–h6), code blocks, blockquotes, unordered/ordered lists, horizontal rules, blank lines
- Custom inline parser: bold, italic, inline code, strikethrough
- Code blocks delegate to `CodeBlock` for syntax highlighting

#### Syntax Highlighter (CodeBlock)
- Custom tokenizer supporting 15 languages: JavaScript, TypeScript, Python, Java, C, C++, SQL, Bash, HTML, CSS, JSON, YAML, XML, Markdown, Plaintext
- VS Code-style light and dark color palettes
- Line numbers
- Horizontal scroll for long lines
- One-tap copy button with "Copied!" feedback (via `expo-clipboard`)

#### Collections
- Create, rename, delete collections with icon selection
- Drill-down into collection to see filtered notes
- Note count badge per collection
- Create-collection modal

#### Search
- Dedicated search screen with full-text search across title, content, and tags
- Live results on keystroke

#### Archive & Trash
- Archive tab with sub-tabs: Archived and Trash
- Restore from archive / unarchive
- Move to trash from archive
- Permanent delete from trash
- Empty trash (bulk delete)

#### Settings
- Theme toggle: Light, Dark, System
- Font size: Small, Medium, Large
- Storage statistics: total notes, archived, trash
- About section with version and GitHub link
- Developer credit: Code With Mukeem

#### Theme System
- Full monochrome light/dark token set in `constants/colors.ts`
- `useColors()` hook reads `SettingsContext` for override, falls back to system color scheme
- Tokens: background, foreground, secondary, border, mutedForeground, primary, success, destructive, isDark

#### Data Layer
- `storage/notes.ts` — AsyncStorage CRUD at key `@codenotes:notes_v1`
- `storage/collections.ts` — AsyncStorage CRUD at key `@codenotes:collections_v1`
- `storage/settings.ts` — AsyncStorage settings persistence with `DEFAULT_SETTINGS`
- `types/index.ts` — `Note`, `Collection`, `AppSettings`, `Language` TypeScript types

#### Utilities
- `generateId()` — timestamp + random suffix
- `getWordCount()`, `getCharCount()`, `getReadingTime()`
- `formatRelativeTime()` — "2 hours ago", "yesterday", etc.
- `stripMarkdown()` — plain-text preview for note cards

#### Components
- `NoteCard` — animated card with title, preview, language badge, pin/favorite/archive badges, relative timestamp
- `CollectionCard` — animated collection card with icon and note count
- `TagPill` — tag chip with selected state
- `SearchBar` — cross-platform search input with clear button
- `EmptyState` — icon + title + subtitle placeholder
- `FAB` — scale-animated floating action button
- `ErrorBoundary` / `ErrorFallback` — graceful crash handling

#### App Configuration
- Bundle ID: `com.codewithmukeem.codenotes` (iOS & Android)
- New Architecture enabled (`newArchEnabled: true`)
- React Compiler enabled
- Typed routes enabled
- Portrait orientation locked

---

## [Unreleased]

### Planned
- EAS Build integration for APK/IPA generation
- Tag-based filtering on Home screen
- Note export (share as `.md` file)
- iCloud / local file backup
- Widget support (iOS)

---

[1.0.0]: https://github.com/codewithmukeem/codenotes/releases/tag/v1.0.0
