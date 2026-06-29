import { Mistral } from "@mistralai/mistralai";
import { chatbotContext } from "@/app/data/chatbotContext";

const apiKey = process.env.MISTRAL_API_KEY;

if (!apiKey) {
  throw new Error("MISTRAL_API_KEY is missing.");
}

const mistral = new Mistral({
  apiKey,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history = [] } = body;

    if (!message?.trim()) {
      return Response.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    const messages = [
      {
        role: "system" as const,
        content: chatbotContext,
      },
      ...history,
      {
        role: "user" as const,
        content: message,
      },
    ];

    const response = await mistral.chat.complete({
      model: "mistral-large-latest",
      temperature: 0.4,
      maxTokens: 500,
      messages,
    });

    const content = response.choices?.[0]?.message?.content;

    let reply = "Sorry, I couldn't generate a response.";

    if (typeof content === "string") {
      reply = content;
    } else if (Array.isArray(content)) {
      reply = content
        .map((item: any) => item.text ?? "")
        .join("");
    }

    return Response.json({ reply });
  } catch (error) {
    console.error("Mistral Error:", error);

    return Response.json(
      {
        error: "Unable to get chatbot response.",
      },
      {
        status: 500,
      }
    );
  }
}
