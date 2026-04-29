import type { Metadata } from "next";
import { Bodoni_Moda, Cormorant_Garamond, Geist, Libre_Caslon_Text } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import "./globals.css";

// Marketing & invite display heading — Bodoni Moda (replaces Yeseva One).
// High-contrast editorial serif. CSS variable kept as --font-yeseva to avoid
// touching all references across the app.
const displaySerif = Bodoni_Moda({
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-yeseva",
  subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
  weight: ["400", "600"],
  variable: "--font-cormorant",
  subsets: ["latin"],
});

// Dashboard sans — Geist (replaces Montserrat). CSS variable kept as
// --font-montserrat to avoid touching ~270 references across the app.
const dashboardSans = Geist({
  weight: ["400", "500", "600"],
  variable: "--font-montserrat",
  subsets: ["latin"],
});

// Libre Caslon Text — editorial italic serif for body/accent text
const libreCaslon = Libre_Caslon_Text({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-caslon",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reserve — The R in RSVP",
  description:
    "Create beautiful digital wedding invitations with RSVP, seating, itinerary, and Q&A — all from one link. No app downloads, no guest logins.",
};

// Inline script prevents flash of wrong theme before React hydrates
const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('tll-theme-v2');
    if (stored === 'dark') document.documentElement.classList.add('dark');
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displaySerif.variable} ${cormorantGaramond.variable} ${dashboardSans.variable} ${libreCaslon.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head />
      <body className="min-h-full flex flex-col">
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
