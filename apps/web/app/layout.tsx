import "./globals.css";
import "leaflet/dist/leaflet.css";
import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { brandPalette, typeScale } from "@parksverige/design-system";

export const metadata: Metadata = {
  title: "ParkSverige",
  description: "Premium parking intelligence for Sweden."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        style={
          {
            "--brand-ink": brandPalette.ink,
            "--brand-mist": brandPalette.mist,
            "--brand-accent": brandPalette.accent,
            "--brand-success": brandPalette.success,
            "--brand-warning": brandPalette.warning,
            "--brand-danger": brandPalette.danger,
            "--font-display": typeScale.display,
            "--font-body": typeScale.body
          } as CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
