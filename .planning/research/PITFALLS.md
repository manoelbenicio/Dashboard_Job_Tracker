# Pitfalls Research — Job Application Tracker

## 1. AI API Key Exposure
- **Warning signs**: API key hardcoded in frontend JavaScript
- **Prevention**: Use environment variables, never commit keys, add .env to .gitignore
- **Phase**: Phase 1 (Settings page should handle API key input)

## 2. LocalStorage Size Limits
- **Warning signs**: Data exceeds ~5MB, silent data loss on save
- **Prevention**: Monitor storage usage, implement data export, warn at 80% capacity
- **Phase**: Phase 1 (implement in persistence hook)

## 3. Drag & Drop Performance
- **Warning signs**: Janky animations with 50+ cards, layout thrashing
- **Prevention**: Virtualize long lists, use CSS transforms not layout properties, limit re-renders
- **Phase**: Phase 1 (Kanban implementation)

## 4. AI Prompt Quality
- **Warning signs**: Generic/useless cover letters, bad resume parsing
- **Prevention**: Iterate on prompts, add user context (skills, experience), temperature tuning
- **Phase**: Phase 1 (cover letter) and Phase 2 (resume parser)

## 5. State Management Complexity
- **Warning signs**: Prop drilling, stale context, unnecessary re-renders
- **Prevention**: Keep contexts focused (Job, Resume, Settings, Chat), use useReducer not useState for complex state
- **Phase**: Phase 1 (context architecture)

## 6. Chart Responsiveness
- **Warning signs**: Charts overflow containers, labels get cut off on resize
- **Prevention**: Use Recharts ResponsiveContainer, test at multiple viewport sizes
- **Phase**: Phase 1 (Dashboard)

## 7. Dark Mode Contrast
- **Warning signs**: Text unreadable, insufficient contrast ratios
- **Prevention**: Test WCAG AA compliance (4.5:1 ratio), use semantic color tokens
- **Phase**: Phase 1 (Design system)

## 8. AI Rate Limiting
- **Warning signs**: 429 errors from Gemini API, degraded UX
- **Prevention**: Debounce AI calls, show loading states, cache results, graceful error handling
- **Phase**: All AI features

## 9. Resume PDF Preview Rendering
- **Warning signs**: Preview doesn't match print output, CSS issues
- **Prevention**: Use @media print styles, test with browser print dialog
- **Phase**: Phase 2 (Resume builder)

## 10. Claire Context Window Overflow
- **Warning signs**: Claire loses context in long conversations, hallucinations
- **Prevention**: Summarize old messages, limit context window, inject fresh stats per message
- **Phase**: Phase 2 (Claire chat)
