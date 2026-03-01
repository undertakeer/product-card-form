// app/api/generateKeywords/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY is not set");
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 500 }
    );
  }

  const openai = new OpenAI({ apiKey });

  try {
    const { productName, description } = await req.json();
    console.log("Received:", { productName, description });

    if (!productName || !description) {
      return NextResponse.json(
        { error: "Product name and description are required" },
        { status: 400 }
      );
    }

    const prompt = `Generate a list of SEO keywords (comma separated) for a product:
Name: ${productName}
Description: ${description}
Output: only keywords, separated by commas.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
    });

    const raw = response.choices[0]?.message?.content?.trim() ?? "";
    const keywords = raw.replace(/\n/g, ", ").replace(/\s*,\s*/g, ", ");
    console.log("AI keywords:", keywords);

    return NextResponse.json({ keywords });
  } catch (err: unknown) {
    const status =
      typeof (err as { status?: number })?.status === "number"
        ? (err as { status: number }).status
        : 500;
    const message =
      status === 429
        ? "API quota exceeded. Check your OpenAI plan and billing at platform.openai.com."
        : err instanceof Error
          ? err.message
          : "AI request failed";
    console.error("OpenAI error:", err);
    return NextResponse.json(
      { error: message },
      { status: status >= 400 && status < 600 ? status : 500 }
    );
  }
}
