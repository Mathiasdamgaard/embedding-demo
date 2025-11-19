import ReactMarkdown from "react-markdown";
import Image from "next/image";

export const TextContentRenderer = ({ text }: { text: string }) => {
  return (
    <ReactMarkdown
      className="prose prose-sm max-w-none text-gray-800"
      components={{
        img: ({ src, alt }) => {
          if (!src || typeof src !== "string") return null;

          return (
            <span className="block my-4">
              <Image
                src={src}
                alt={alt || "Product Image"}
                width={300}
                height={300}
                className="object-cover rounded-lg shadow-md"
                unoptimized // Safety for external domains
              />
            </span>
          );
        },
        ul: ({ children }) => (
          <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>
        ),
        li: ({ children }) => <li>{children}</li>,
        strong: ({ children }) => (
          <span className="font-bold text-blue-700">{children}</span>
        ),
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
      }}
    >
      {text}
    </ReactMarkdown>
  );
};
