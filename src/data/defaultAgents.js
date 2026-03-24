export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export const COLOR_POOLS = [
  'linear-gradient(135deg,#7c6af7,#56cfb2)',
  'linear-gradient(135deg,#f7816a,#f7c56a)',
  'linear-gradient(135deg,#56cfb2,#4ab8f7)',
  'linear-gradient(135deg,#f7c56a,#f7816a)',
  'linear-gradient(135deg,#4ab8f7,#7c6af7)',
  'linear-gradient(135deg,#f76a9b,#f7816a)',
  'linear-gradient(135deg,#a0f76a,#56cfb2)',
];

export function colorFor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return COLOR_POOLS[h % COLOR_POOLS.length];
}

export const DEFAULT_AGENTS = [
  {
    id: uid(), name: 'General Purpose', icon: '🧠', category: 'General', status: 'active',
    purpose: 'Handles complex, multi-step research and coding tasks autonomously. The swiss-army knife agent for open-ended problems.',
    tools: 'All tools',
    trigger: 'When searching for a keyword or file and not confident you will find the right match in the first few tries.',
    tags: ['research', 'multi-step', 'autonomous'],
    notes: 'Best for exploratory or ambiguous tasks where you need broad tool access.',
  },
  {
    id: uid(), name: 'Explore', icon: '🔍', category: 'Exploration', status: 'active',
    purpose: 'Fast codebase exploration. Finds files by glob patterns, searches code for keywords, and answers structural questions about the codebase.',
    tools: 'Glob, Grep, Read, Bash (no Edit/Write)',
    trigger: 'Quickly find files by pattern (e.g. src/**/*.tsx) or search code for keywords.',
    tags: ['fast', 'exploration', 'read-only'],
    notes: 'Specify thoroughness: quick / medium / very thorough. Read-only — safe to run freely.',
  },
  {
    id: uid(), name: 'Plan', icon: '📐', category: 'Code Quality', status: 'active',
    purpose: 'Software architect agent. Designs implementation plans, identifies critical files, and considers architectural trade-offs before any code is written.',
    tools: 'All tools except Edit, Write, NotebookEdit',
    trigger: 'When you need to plan an implementation strategy for a non-trivial task.',
    tags: ['architecture', 'planning', 'design'],
    notes: 'Returns step-by-step plans. Run before writing code to align on approach.',
  },
  {
    id: uid(), name: 'Claude Code Guide', icon: '📖', category: 'Documentation', status: 'active',
    purpose: 'Answers questions about Claude Code CLI features, hooks, slash commands, MCP servers, settings, IDE integrations, keyboard shortcuts, Agent SDK, and the Claude API.',
    tools: 'Glob, Grep, Read, WebFetch, WebSearch',
    trigger: 'When the user asks "Can Claude…", "Does Claude…", "How do I…" about Claude Code or the Anthropic API.',
    tags: ['documentation', 'help', 'api'],
    notes: 'Do not spawn if a recent claude-code-guide agent is already running — continue via SendMessage instead.',
  },
  {
    id: uid(), name: 'Test Generator', icon: '🧪', category: 'Testing', status: 'experimental',
    purpose: 'Generates test cases (unit, integration, exploratory charters) from source code or specifications. Covers happy paths, edge cases, and failure modes.',
    tools: 'Read, Grep, Glob, Write',
    trigger: 'When you have new or changed code and need test coverage quickly.',
    tags: ['test-generation', 'coverage', 'automation'],
    notes: 'Review generated tests for correctness — LLM may miss domain-specific invariants.',
  },
  {
    id: uid(), name: 'Bug Finder', icon: '🐛', category: 'Testing', status: 'experimental',
    purpose: 'Performs static analysis-style review to surface potential bugs, null-pointer risks, off-by-one errors, unhandled exceptions, and logic flaws.',
    tools: 'Read, Grep, Glob',
    trigger: 'Before code review or after a production incident — ask "what could go wrong here?"',
    tags: ['bugs', 'static-analysis', 'review'],
    notes: 'Works best on focused, bounded scopes (single module). Broad scans can produce noise.',
  },
  {
    id: uid(), name: 'Exploratory Test Charter Agent', icon: '🗺️', category: 'Testing', status: 'experimental',
    purpose: 'Creates structured exploratory testing charters from a feature description or user story. Identifies risk areas, suggests personas, and defines mission/timeboxes.',
    tools: 'Read, WebSearch',
    trigger: 'When preparing an exploratory testing session for a new feature or unfamiliar area.',
    tags: ['exploratory', 'charters', 'testing'],
    notes: 'Output charters in SBTM or ET square format. Pair with a human tester for execution.',
  },
  {
    id: uid(), name: 'Security Reviewer', icon: '🔒', category: 'Security', status: 'experimental',
    purpose: 'Reviews code for OWASP Top 10 vulnerabilities, injection risks, auth/authz flaws, secrets in code, and insecure defaults.',
    tools: 'Read, Grep, Glob',
    trigger: 'Before merging user-facing features or any code that handles credentials, tokens, or user input.',
    tags: ['security', 'owasp', 'review'],
    notes: 'For authorized security testing only. Always have a human verify findings before acting.',
  },
  {
    id: uid(), name: 'Statusline Setup', icon: '⚙️', category: 'Infrastructure', status: 'active',
    purpose: "Configures the Claude Code status line setting in the user's environment.",
    tools: 'Read, Edit',
    trigger: 'When the user wants to configure or troubleshoot the Claude Code terminal status line.',
    tags: ['config', 'setup', 'cli'],
    notes: 'Narrow-scope agent — only touches statusline configuration.',
  },
  {
    id: uid(), name: 'Regression Risk Analyzer', icon: '📉', category: 'Testing', status: 'experimental',
    purpose: 'Analyzes a diff or list of changed files and identifies which existing tests are most likely to fail and which areas lack test coverage for the change.',
    tools: 'Read, Grep, Glob, Bash',
    trigger: 'After a large refactor or before a release — "what might break?"',
    tags: ['regression', 'risk', 'coverage-gap'],
    notes: 'Pairs well with the Explore agent to map change scope before analysis.',
  },
];
