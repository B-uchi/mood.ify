import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Mood.ify",
  description: "Create magical playlists from your feelings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
