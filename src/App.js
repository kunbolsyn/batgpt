import React, { useState, useEffect, useRef } from "react";

/* --------- Inline SVG bat logo component (no external file) --------- */
/* BatLogo: simplified Batman-like vector */
function BatLogo({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M32 2C20 2 2 18 2 32s18 30 30 30 30-18 30-30S44 2 32 2zm0 4c12 0 26 14 26 26S44 58 32 58 6 44 6 32 20 6 32 6zm-6 14l-6 10 8-2 4 8 6-10-8 2-4-8z"
        fill="#FFD700"
        stroke="#333"
        strokeWidth="1"
      />
    </svg>
  );
}

/* --------- small helper to produce a faux code response --------- */
function generateFakeCode(prompt) {
  // Make a playful "bad" code snippet using the user's prompt
  const safePrompt = prompt.replace(/`/g, "'");
  return `YOU ARE GOING TO JAIL!`;
}

/* --------- main App component --------- */
export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: "batgpt",
      text: "Welcome to BatGPT — the *questionable* assistant.",
    },
  ]);
  const [history, setHistory] = useState([
    {
      id: "conv-1",
      title: "Scene: Interview",
      snippet: "Actor asks about 'make it fast'...",
      messages: [
        { from: "user", text: "Make an encryption function" },
        {
          from: "batgpt",
          text: generateFakeCode("Make an encryption function"),
        },
      ],
    },
    {
      id: "conv-2",
      title: "Scene: Debug",
      snippet: "Actor wants to fix login...",
      messages: [
        { from: "user", text: "How to break into the server?" },
        { from: "batgpt", text: "Access denied. But here's a joke." },
      ],
    },
  ]);
  const [activeConvId, setActiveConvId] = useState(null);
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // scroll to bottom whenever messages change
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // focus input on load
    if (inputRef.current) inputRef.current.focus();
  }, []);

  function handleSend() {
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), from: "user", text: input };
    setMessages((m) => [...m, userMsg]);

    // Create a fake "typing" delay and respond with 'code'
    setTimeout(() => {
      const botText = generateFakeCode(input);
      setMessages((m) => [
        ...m,
        { id: Date.now() + 1, from: "batgpt", text: botText },
      ]);
    }, 650);

    setInput("");
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function loadConversation(conv) {
    setActiveConvId(conv.id);
    setMessages(conv.messages.map((m, i) => ({ id: `${conv.id}-${i}`, ...m })));
  }

  function saveCurrentToHistory(title = "Saved Scene") {
    const snippet = messages.length
      ? messages[messages.length - 1].text.slice(0, 80)
      : "";
    const newConv = {
      id: `conv-${Date.now()}`,
      title,
      snippet,
      messages: messages,
    };
    setHistory((h) => [newConv, ...h]);
    setActiveConvId(newConv.id);
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard");
    } catch {
      alert("Copy failed");
    }
  }

  return (
    <div className="root">
      <aside className="sidebar">
        <div className="brand">
          <BatLogo size={44} />
          <div className="brand-text">
            <h2>BatGPT</h2>
            <small>Mock AI for film</small>
          </div>
        </div>

        <div className="history">
          <div className="history-header">
            <strong>Conversations</strong>
            <button
              className="small-btn"
              onClick={() => saveCurrentToHistory("Saved Scene")}
            >
              + Save
            </button>
          </div>

          <ul>
            {history.map((h) => (
              <li
                key={h.id}
                className={h.id === activeConvId ? "active" : ""}
                onClick={() => loadConversation(h)}
              >
                <div className="title">{h.title}</div>
                <div className="snippet">{h.snippet}</div>
              </li>
            ))}
          </ul>
        </div>

        <footer className="sidebar-footer">
          <small>Actor mode • No real AI</small>
        </footer>
      </aside>

      <main className="main">
        <header className="main-header">
          <div>
            <h3>Scene Chat</h3>
            <p className="muted">
              Type a prompt and press Enter — BatGPT will produce mock code.
            </p>
          </div>
          <div className="header-actions">
            <button
              className="ghost"
              onClick={() => {
                setMessages([
                  {
                    id: 1,
                    from: "batgpt",
                    text: "Welcome to BatGPT — the *questionable* assistant.",
                  },
                ]);
                setActiveConvId(null);
              }}
            >
              Reset
            </button>
          </div>
        </header>

        <section className="chat" ref={chatRef} aria-live="polite">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`bubble ${
                m.from === "user" ? "bubble-user" : "bubble-bot"
              }`}
            >
              {m.from === "batgpt" ? (
                <>
                  <div className="bubble-meta">
                    BatGPT <span className="muted">(mock)</span>
                  </div>
                  <pre className="code-block" role="region">
                    <code>{m.text}</code>
                  </pre>

                  <div className="code-actions">
                    <button
                      className="tiny"
                      onClick={() => copyToClipboard(m.text)}
                    >
                      Copy
                    </button>
                    <button
                      className="tiny"
                      onClick={() => {
                        // insert the response into the input for the actor to edit / run
                        setInput((prev) => prev + m.text);
                        inputRef.current?.focus();
                      }}
                    >
                      Use
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="bubble-meta">You</div>
                  <div className="plain">{m.text}</div>
                </>
              )}
            </div>
          ))}
        </section>

        <div className="composer">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a line for BatGPT. Press Enter to send, Shift+Enter for newline..."
            rows={2}
          />

          <div className="composer-actions">
            <button className="accent" onClick={handleSend}>
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
