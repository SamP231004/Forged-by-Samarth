import { Fragment } from "react";

type Segment = string | { text: string; className?: string };

/**
 * Reveals a headline word by word with a soft blur-to-sharp transition.
 * Pure CSS so it plays immediately, before any JavaScript loads.
 */
export function TextReveal({
  segments,
  delay = 0,
  className,
}: {
  segments: Segment[];
  delay?: number;
  className?: string;
}) {
  let i = 0;
  const words = segments.flatMap((seg) => {
    const { text, className } = typeof seg === "string" ? { text: seg, className: undefined } : seg;
    return text
      .split(" ")
      .filter(Boolean)
      .map((w) => ({ w, className, index: i++ }));
  });

  return (
    <span className={className}>
      <span className="sr-only">{words.map((x) => x.w).join(" ")}</span>
      <span aria-hidden>
        {words.map(({ w, className, index }) => (
          <Fragment key={index}>
            <span
              className={`animate-word inline-block ${className ?? ""}`}
              style={{ animationDelay: `${delay + index * 0.045}s` }}
            >
              {w}
            </span>{" "}
          </Fragment>
        ))}
      </span>
    </span>
  );
}
