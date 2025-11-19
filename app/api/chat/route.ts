import { streamText, convertToModelMessages, UIMessage } from "ai";
import { azure, findRelevantContent } from "@/lib/ai/embedding";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Get the last user message text
  const lastMessage = messages[messages.length - 1];

  // Robustly extract text from the strict UIMessage structure
  const userQuery = lastMessage.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join(" ");

  // 1. Retrieve context
  const similarProducts = await findRelevantContent(userQuery);

  // 2. Format context for the LLM
  const productContext = similarProducts
    .map(
      (p) =>
        `Product: ${p.name} ($${p.price})\nDetails: ${p.description}\n![${p.name}](${p.imageUrl})`
    )
    .join("\n\n");

  // 3. Stream the response
  const result = streamText({
    model: azure("gpt-5-mini"),
    messages: convertToModelMessages(messages),
    system: `You are a helpful shopping assistant.
    Use the following product information to answer the user's question.
    If there are no products do NOT generate any products.
    
    INSTRUCTION: Format your response using Markdown. 
    - Use **bold** for product names and prices.
    - Use lists for features.
    - When showing a product, include its image exactly as provided in the context using Markdown syntax: ![Product Name](URL).
    
    CONTEXT:
    ${productContext}`,
  });

  return result.toUIMessageStreamResponse();
}
