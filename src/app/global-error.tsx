"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#0b0a12",
          color: "#f6efe2",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              maxWidth: 480,
              width: "100%",
              border: "1px solid rgba(201,162,39,0.3)",
              borderRadius: 24,
              padding: 32,
              background: "rgba(14,12,22,0.85)",
            }}
          >
            <p style={{ margin: 0, fontSize: 11, letterSpacing: "0.28em", color: "#c9a227" }}>ONCEUPON</p>
            <h1 style={{ margin: "12px 0 0", fontSize: 28 }}>The pad could not load</h1>
            <p style={{ margin: "12px 0 0", color: "#cbbfa8", lineHeight: 1.5 }}>
              {error.message || "Sign in with X. OnceUpon prints and trades on Arc."}
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: 24,
                border: 0,
                borderRadius: 999,
                padding: "10px 18px",
                background: "#c9a227",
                color: "#0b0a12",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Reload
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
