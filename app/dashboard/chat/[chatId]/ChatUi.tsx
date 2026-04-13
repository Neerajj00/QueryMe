import { Message } from "@/types";

export default function ChatUi({
  messages,
  onSend,
  onRunQuery,
}: any) {
  return (
    <div className="flex flex-col h-full bg-[#0f0f0f] text-white">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg: any) => (
          <div key={msg.id} className="space-y-2">

            <div
              className={`px-4 py-3 rounded-2xl max-w-xl ${
                msg.role === "user"
                  ? "bg-blue-600 ml-auto"
                  : "bg-zinc-800"
              }`}
            >
              {msg.content}
            </div>

            {/* SQL */}
            {msg.generatedSQL && (
              <div className="bg-black p-3 rounded border border-zinc-700">
                <code>{msg.generatedSQL}</code>

                <button
                  className="mt-2 bg-green-600 px-3 py-1 rounded"
                  onClick={() =>
                    onRunQuery(msg.id, msg.generatedSQL)
                  }
                >
                  Run Query
                </button>
              </div>
            )}

            {/* RESULT */}
            {msg.result && (
              <div className="overflow-auto border border-zinc-700 rounded">
                <table className="min-w-full text-sm">
                  <thead className="bg-zinc-800">
                    <tr>
                      {Object.keys(msg.result[0] || {}).map((k) => (
                        <th key={k} className="px-3 py-2 text-left">
                          {k}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {msg.result.map((row: any, i: number) => (
                      <tr key={i} className="border-t border-zinc-700">
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
            )}

          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-zinc-800">
        <input
          className="w-full bg-zinc-900 px-4 py-2 rounded"
          placeholder="Ask your database..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSend(e.currentTarget.value);
              e.currentTarget.value = "";
            }
          }}
        />
      </div>
    </div>
  );
}