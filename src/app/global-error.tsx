"use client";

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  void _error;
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui", padding: "2rem", textAlign: "center" }}>
        <h1>Something went wrong</h1>
        <p style={{ color: "#666", marginBottom: "1rem" }}>
          A critical error occurred. Try again or go home.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            padding: "0.5rem 1rem",
            background: "#0d9488",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
        <br />
        <a href="/" style={{ display: "inline-block", marginTop: "1rem", color: "#0d9488" }}>
          Go home
        </a>
      </body>
    </html>
  );
}
