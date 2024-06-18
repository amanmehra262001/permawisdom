import Image from "next/image";
import { Inter } from "next/font/google";
import { Navigation } from "@/components/navigation";
import { MainFrame } from "@/components/mainframe";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main className={`flex h-screen gap-8 ${inter.className}`}>
      <Navigation />
      <MainFrame />
    </main>
  );
}
