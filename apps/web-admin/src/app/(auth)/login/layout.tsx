import type { Metadata } from "next";

export const metadata: Metadata = { title: "Acessar" };

export default function SegmentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
