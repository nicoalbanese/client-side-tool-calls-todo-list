import { tools } from "@/ai/tools";
import { openai } from "@ai-sdk/openai";
import { Message, streamText } from "ai";

export const POST = async (request: Request) => {
  const { messages }: { messages: Message[]; todos: unknown } =
    await request.json();

  const result = await streamText({
    model: openai("gpt-4o"),
    system:
      "You are a weather assistant.",
    messages: messages,
    tools,
  });

  return result.toDataStreamResponse();
};
