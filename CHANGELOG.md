# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-01-27

### Added

#### Core Features
- Tiptap-based rich text editor with Notion-like UX
- Slash command menu with 35+ commands
- Bubble menu for text formatting
- Table support with cell merging, background colors
- Drag & drop block reordering

#### Custom Blocks (28 types)
- **Media**: ImageNode, EmbedNode (YouTube, Vimeo, CodeSandbox, StackBlitz, Replit)
- **Layout**: CalloutNode, ToggleNode, BookmarkNode
- **Code**: CodeBlock with syntax highlighting (26 languages), TerminalNode, ApiBlockNode
- **Diagrams**: MermaidNode, DiagramNode (PlantUML, D2)
- **Math**: MathNode (KaTeX LaTeX)
- **Developer**: DiffBlockNode, EnvBlockNode, GistNode, GraphQLNode, OpenAPINode
- **Documentation**: ChangelogNode, ErrorMessageNode, FootnoteNode, LogBlockNode, MetadataNode, OsCommandNode, StackTraceNode, TocNode
- **Files**: FileAttachmentNode with PDF preview

#### Interactive Features
- Emoji picker (`/emoji`)
- Mention support (`@`)
- Collaboration support (Y.js based)

#### Internationalization
- English locale (default)
- Korean locale

#### Security
- URL validation (javascript:, vbscript:, data: blocked)
- SSRF protection (private IP, localhost, cloud metadata blocked)
- HTML sanitization support (DOMPurify integration)

### Fixed
- Mermaid orphan SVG cleanup on syntax errors

---

## [Unreleased]

### Planned
- Additional language locales
- More diagram types
- Plugin system documentation
