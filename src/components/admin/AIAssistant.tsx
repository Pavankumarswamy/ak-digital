import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
}

export function AIFormBuilder({ form, setForm }: { form: any, setForm: any }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I am your AI Form Builder. Tell me what kind of form you want to create or how you want to modify the existing one."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const extractAndApplyJSON = (text: string) => {
    try {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match && match[1]) {
        const parsed = JSON.parse(match[1]);
        if (Array.isArray(parsed)) {
          setForm((prev: any) => ({ ...prev, customFields: parsed }));
        }
      }
    } catch (e) {
      // Ignore parse errors during streaming
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const systemPrompt = `You are an expert form building assistant for the AK Digital Hub admin panel.
Your job is to listen to the user's requirements and generate or modify the form configuration.
You MUST output the full updated form as a JSON array wrapped in \`\`\`json ... \`\`\` codeblock.

Field schema (each item in the array):
{
  "id": "unique-id-string",           // required, unique short string
  "type": "text|textarea|number|date|phone|email|image|label",
  "label": "Question or label text",  // required
  "required": true|false,
  "width": "full|half",
  "placeholder": "optional",
  "phoneDefaultCountry": "+91",       // only if type === "phone"
  "imageMaxSizeMB": 5,                // only if type === "image"
  "imageAllowedExtensions": [".jpg", ".png", ".pdf"]  // only if type === "image"
}

Current service: "${form.title}"
Current form fields:
\`\`\`json
${JSON.stringify(form.customFields, null, 2)}
\`\`\`

Always return the COMPLETE updated array, not a partial diff.`;

      const apiMessages = [
        { role: "system", content: systemPrompt },
        ...newMessages.map(m => ({ role: m.role, content: m.content }))
      ];

      // Add temporary placeholder for streaming / loading message
      setMessages(prev => [...prev, { role: "assistant", content: "Thinking..." }]);

      const response = await fetch("/api/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages: apiMessages })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || `Server error: ${response.status}`);
      }

      const result = await response.json();

      const choice = result.choices?.[0];
      const assistantMessage = choice?.message?.content || "";
      const reasoningContent = choice?.message?.reasoning_content || "";

      setMessages(prev => {
        const updated = [...prev];
        if (updated[updated.length - 1]?.content === "Thinking...") {
          updated.pop();
        }
        return [...updated, {
          role: "assistant",
          content: assistantMessage,
          reasoning: reasoningContent
        }];
      });

      extractAndApplyJSON(assistantMessage);

    } catch (error: any) {
      console.error("AIFormBuilder error:", error);
      setMessages(prev => {
        const updated = [...prev];
        if (updated[updated.length - 1]?.content === "Thinking...") {
          updated.pop();
        }
        return [...updated, {
          role: "assistant",
          content: `⚠️ Error: ${error.message}`
        }];
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full border border-white/10 bg-white/5 rounded-xl overflow-hidden">
      <div className="bg-white/5 px-4 py-3 border-b border-white/10 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-neon" />
        <h3 className="font-semibold text-sm text-white">AI Form Builder</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                <Bot className="h-4 w-4 text-neon" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${msg.role === 'user'
              ? 'bg-neon text-background font-semibold rounded-tr-sm'
              : 'bg-white/5 border border-white/10 text-white rounded-tl-sm'
              }`}>
              {msg.reasoning && (
                <div className="mb-2 text-xs text-white/60 italic border-b border-white/10 pb-2">
                  <span className="font-semibold not-italic">Thinking...</span><br />
                  {msg.reasoning}
                </div>
              )}
              <div className="whitespace-pre-wrap">
                {msg.content.replace(/```json[\s\S]*?```/, '[Form Configuration Updated - See Live Preview]')}
              </div>
            </div>
            {msg.role === 'user' && (
              <div className="h-8 w-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-transparent">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="E.g. Create a PAN card application form..."
            className="w-full bg-white/5 border border-white/10 rounded-full pl-4 pr-12 py-2.5 text-sm text-white focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon placeholder:text-white/40"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-1 top-1 bottom-1 aspect-square bg-neon text-background rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-neon/90 transition-colors"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin text-background" /> : <Send className="h-4 w-4 ml-0.5 text-background" />}
          </button>
        </div>
      </form>
    </div>
  );
}
