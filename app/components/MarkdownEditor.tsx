"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  value: string;
  onChange: (v: string) => void;
};

type ToolDef = { label: string; title: string; action: (sel: string) => { text: string; offset: number } };

const tools: ToolDef[] = [
  { label: "B",   title: "Bold",          action: (s) => ({ text: `**${s || "bold text"}**`,    offset: 2  }) },
  { label: "I",   title: "Italic",        action: (s) => ({ text: `*${s || "italic text"}*`,    offset: 1  }) },
  { label: "H1",  title: "Heading 1",     action: (s) => ({ text: `# ${s || "Heading"}`,        offset: 2  }) },
  { label: "H2",  title: "Heading 2",     action: (s) => ({ text: `## ${s || "Heading"}`,       offset: 3  }) },
  { label: "H3",  title: "Heading 3",     action: (s) => ({ text: `### ${s || "Heading"}`,      offset: 4  }) },
  { label: "</>", title: "Inline code",   action: (s) => ({ text: `\`${s || "code"}\``,         offset: 1  }) },
  { label: "```", title: "Code block",    action: (s) => ({ text: `\`\`\`\n${s || "code"}\n\`\`\``, offset: 4 }) },
  { label: "🔗",  title: "Link",          action: (s) => ({ text: `[${s || "link text"}](url)`, offset: 1  }) },
  { label: "—",   title: "Divider",       action: ()  => ({ text: `\n---\n`,                    offset: 5  }) },
  { label: "•",   title: "Bullet list",   action: (s) => ({ text: `- ${s || "item"}`,           offset: 2  }) },
];

export default function MarkdownEditor({ value, onChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [tab, setTab] = useState<"write" | "preview">("write");

  function applyTool(tool: ToolDef) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end);
    const { text, offset } = tool.action(selected);
    const newVal = value.slice(0, start) + text + value.slice(end);
    onChange(newVal);
    setTimeout(() => {
      ta.focus();
      const cursor = start + offset + (selected ? selected.length : text.length - offset * 2);
      ta.setSelectionRange(cursor, cursor);
    }, 0);
  }

  return (
    <div className="editor-wrap">
      <div className="editor-topbar">
        <div className="editor-toolbar">
          {tools.map((t) => (
            <button
              key={t.label}
              type="button"
              className="editor-btn"
              title={t.title}
              onClick={() => applyTool(t)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="editor-tab-btns">
          <button type="button" className={`editor-tab${tab === "write" ? " active" : ""}`} onClick={() => setTab("write")}>Write</button>
          <button type="button" className={`editor-tab${tab === "preview" ? " active" : ""}`} onClick={() => setTab("preview")}>Preview</button>
        </div>
      </div>

      <div className="editor-body">
        <textarea
          ref={textareaRef}
          className="editor-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write your project description in markdown…"
          spellCheck={false}
          style={{ display: tab === "preview" ? "none" : undefined }}
        />
        <div className={`editor-preview${tab === "preview" ? " preview-active" : ""}`}>
          <span className="editor-preview-label">Preview</span>
          {value ? (
            <div className="markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            </div>
          ) : (
            <p style={{ color: "var(--text-subtle)", fontSize: "13px" }}>Nothing to preview yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
