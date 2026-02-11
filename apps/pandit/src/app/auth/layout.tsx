import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login — HmarePanditJi Pandit Portal",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
