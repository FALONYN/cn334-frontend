"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChatPage() {

  const router = useRouter();

  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {

    if (!input) return;

    const userMessage = { role: "user", text: input };
    setMessages(prev => [...prev, userMessage]);

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    try {

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey!
          },
          body: JSON.stringify({
            system_instruction: {
              parts: [
                { text: "You are a Thai Healthcare Assistant AI from TU-PINE Care" }
              ]
            },
            contents: [
              {
                parts: [{ text: input }]
              }
            ]
          })
        }
      );

      const data = await response.json();
      console.log("API Response:", data);

      const aiText =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "AI ไม่ตอบ";

      const aiMessage = { role: "ai", text: aiText };

      setMessages(prev => [...prev, aiMessage]);

    } catch (err) {
      console.error(err);
    }

    setInput("");

  };

  return (

    <div className="flex flex-col h-screen bg-white">

      {/* header */}

      <div className="border-b p-4 flex items-center justify-between max-w-4xl mx-auto w-full">

        <button
          onClick={() => router.push("/")}
          className="text-blue-600 font-medium hover:underline"
        >
          ← กลับหน้าหลัก
        </button>

        <h1 className="text-xl font-bold text-blue-600">
          TU-PINE Care AI
        </h1>

        <div></div>

      </div>

      {/* chat area */}

      <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">

        {messages.map((msg, i) => (

          <div
            key={i}
            className={`flex mb-4 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >

            <div
              className={`
                max-w-[70%] px-4 py-3 rounded-2xl shadow
                ${
                  msg.role === "user"
                    ? "bg-white border text-gray-800"
                    : "bg-blue-500 text-white"
                }
              `}
            >
              {msg.text}
            </div>

          </div>

        ))}

      </div>

      {/* input */}

      <div className="border-t p-4 bg-white">

        <div className="flex gap-2 max-w-4xl mx-auto">

          <input
            className="flex-1 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="พิมพ์คำถามสุขภาพ..."
          />

          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-6 rounded-xl hover:bg-blue-600"
          >
            ส่ง
          </button>

        </div>

      </div>

    </div>

  );
}