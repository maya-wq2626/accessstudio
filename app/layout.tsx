import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "AccessStudio | Grow your ideas with Dr. Maya",
  description:
    "AccessStudio helps Dr. Maya's Access to Computers students build their own learning app, step by step, and share it on the class wall.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-soil">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <Header />
        <main id="main" className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
          {children}
        </main>
        <footer className="border-t-2 border-sage-dark bg-sage px-4 py-8">
          <div className="mx-auto max-w-6xl text-center">
            <p className="text-lg font-bold">AccessStudio</p>
            <p className="mt-1 text-lg">grow your ideas with Dr. Maya</p>
            <p className="mt-2 text-base">
              Made for Dr. Maya&rsquo;s Access to Computers students at Ventura
              College.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
