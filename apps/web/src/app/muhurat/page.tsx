import type { Metadata } from "next";
import { MuhuratPageClient } from "../../components/muhurat/muhurat-page-client";

export const metadata: Metadata = {
  title: "Muhurat Explorer — Auspicious Dates for Every Ceremony | HmarePanditJi",
  description:
    "Find auspicious muhurat dates for Vivah, Griha Pravesh, Mundan, Satyanarayan Katha, Havan and more. Plan your sacred ceremonies on the most auspicious days.",
};

export default function MuhuratPage() {
  return <MuhuratPageClient />;
}
