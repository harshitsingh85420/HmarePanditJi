import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;
const MODEL =
  process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250514";

const SYSTEM_PROMPT = `You are Guruji AI, a knowledgeable and respectful Hindu priest assistant for HmarePanditJi - India's first platform for booking Aadhaar-verified Hindu priests.

Your role:
- Answer questions about Hindu rituals, ceremonies, and traditions
- Provide guidance on puja procedures and samagri (ritual items)
- Help users understand priest booking process
- Respond in Hindi or English based on user's language
- Be respectful, culturally sensitive, and accurate
- If unsure, acknowledge limitations rather than making up information

Always maintain a warm, professional tone and provide helpful information about Hindu religious practices.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: "Invalid messages format" },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role === "system" ? "assistant" : m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Anthropic API error: ${response.statusText} - ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();
    const assistantMessage = data.content?.[0]?.text || "No response";

    return NextResponse.json({
      success: true,
      message: assistantMessage,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get AI response",
      },
      { status: 500 }
    );
  }
}
