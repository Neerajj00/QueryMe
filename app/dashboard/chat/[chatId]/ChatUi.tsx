import { useEffect, useRef, useState } from "react";

export default function ChatUi({ messages, onSend, onRunQuery }: any) {
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  const bottomRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);


  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-[5%] md:px-[10%] lg:px-[20%] py-4 space-y-4">
        {messages.map((msg: any) => {
          const isUser = msg.role === "user";

          return (
            <div key={msg.id} className="space-y-2">
              {/* USER MESSAGE */}
              {isUser && (
                <div className="flex justify-end">
                  <div className="px-3 py-2 rounded-lg text-sm max-w-[80%] bg-primary text-primary-foreground">
                    {msg.content}
                  </div>
                </div>
              )}

              {/* ASSISTANT BLOCK */}
              {!isUser && (
                <div className="flex justify-start">
                  <div className="w-full max-w-[80%] space-y-2">
                    {/* DOT LOADER */}
                    {!msg.generatedSQL && (
                      <div className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-muted w-fit">
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                      </div>
                    )}

                    {/* SQL BLOCK */}
                    {msg.generatedSQL && (
                      <div className="relative rounded-lg border border-muted/40 bg-background/50 p-3 text-xs font-mono">
                        
                        {/* ACTION BUTTONS */}
                        <div className="absolute top-2 right-2 flex items-center gap-1">

                          {/* COPY BUTTON */}
                          <div className="relative">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(msg.generatedSQL);
                                setCopiedMap((prev) => ({ ...prev, [msg.id]: true }));
                                setTimeout(() => {
                                  setCopiedMap((prev) => ({ ...prev, [msg.id]: false }));
                                }, 1000);
                              }}
                              className="p-1.5 rounded-md hover:bg-muted transition"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                viewBox="0 0 24 24"
                              >
                                <rect x="9" y="9" width="13" height="13" rx="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                              </svg>
                            </button>

                            {/* TOOLTIP */}
                            {copiedMap[msg.id] && (
                              <div className="absolute -top-6 right-0 text-[10px] bg-black text-white px-2 py-0.5 rounded">
                                Copied!
                              </div>
                            )}
                          </div>

                          {/* RUN SQL BUTTON */}
                          <button
                            onClick={async () => {
                              setLoadingMap((prev) => ({ ...prev, [msg.id]: true }));
                              await onRunQuery(msg.id, msg.generatedSQL);
                              setLoadingMap((prev) => ({ ...prev, [msg.id]: false }));
                            }}
                            className="p-1.5 rounded-md hover:bg-muted transition flex items-center justify-center"
                          >
                            {loadingMap[msg.id] ? (
                              <span className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <svg
                                className="w-3.5 h-3.5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M6 4l10 6-10 6V4z" />
                              </svg>
                            )}
                          </button>

                        </div>

                        {/* SQL TEXT */}
                        <pre className="whitespace-pre-wrap break-words pr-14">
                          {msg.generatedSQL}
                        </pre>
                      </div>
                    )}

                    {/* RESULT */}
                    {msg.result && <ResultToggle result={msg.result} />}
                  </div>
                </div>
              )}
            </div>
          );
        })}

<div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="sticky bottom-0 w-full py-4 px-[5%] md:px-[10%] lg:px-[20%] flex items-center gap-2 border-t bg-background">
        <textarea
          rows={1}
          className="flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none"
          placeholder="Send a message..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend(e.currentTarget.value);
              e.currentTarget.value = "";
            }
          }}
        />

        <button
          onClick={(e: any) => {
            const textarea = e.currentTarget.previousSibling;
            if (textarea?.value) {
              onSend(textarea.value);
              textarea.value = "";
            }
          }}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
}

/* RESULT TOGGLE */
function ResultToggle({ result }: any) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((p) => !p)}
        className="text-xs underline text-muted-foreground"
      >
        {open ? "Hide Result" : "Show Result"}
      </button>

      <div
        className={`transition-all duration-200 overflow-hidden ${
          open ? "max-h-[500px] mt-2" : "max-h-0"
        }`}
      >
        <div className="overflow-auto border border-muted/40 rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-muted">
              <tr>
                {Object.keys(result[0] || {}).map((k) => (
                  <th key={k} className="px-3 py-2 text-left">
                    {k}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.map((row: any, i: number) => (
                <tr key={i} className="border-t">
                  {Object.values(row).map((v: any, j) => (
                    <td key={j} className="px-3 py-2">
                      {String(v)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}