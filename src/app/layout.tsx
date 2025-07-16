import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css"
import 'react-chat-elements/dist/main.css'
import { config } from "@fortawesome/fontawesome-svg-core";
import { Toaster } from "react-hot-toast";
import Providers from "./providers";
import Loading from "@/components/mask/Loading";

config.autoAddCss = false;
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chatgram | Home",
  description: "Your 24/7 Leading Chatgram",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Toaster position="bottom-center" />
          {children}
          <Loading />
        </Providers>
      </body>
    </html>
  );
}

