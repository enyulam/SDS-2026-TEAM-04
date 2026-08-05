import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "B.E.S.T. Coach",
    template: "%s · B.E.S.T. Coach",
  },
  description: "Trainer-led B.E.S.T. observation and report review workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The final MVP is a light design. The root element carries the light canvas so no
    // dark surface shows through during hydration or over-scroll (F1).
    <html lang="en" className="h-full bg-canvas">
      <body className="min-h-full bg-canvas text-ink antialiased">{children}</body>
    </html>
  );
}
