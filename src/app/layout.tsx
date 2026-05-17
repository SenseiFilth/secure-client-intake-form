import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Client Intake Request | Brightpath Home Care",
  description:
    "Submit a care inquiry for home care or personal support services. Secure, private, and confidential intake process.",
  robots: {
    // Prevent search engines from indexing this demo form
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-slate-50 via-brand-50 to-teal-50">
        {children}
      </body>
    </html>
  );
}
