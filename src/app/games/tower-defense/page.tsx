import { Metadata } from "next";
import CategoryBackButton from "@/components/CategoryBackButton";
import TowerDefenseGame from "@/components/games/tower-defense/TowerDefenseGame";

export const metadata: Metadata = {
  title: "Tower Defense of Knowledge | Wisdom Tower Academy",
  description:
    "Survive academic waves and defend your Knowledge Citadel using authentic national entrance and exit exam questions.",
};

export default function TowerDefensePage() {
  return (
    <div className="relative min-h-[90vh]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <CategoryBackButton fallback="/academy" />
      </div>
      <TowerDefenseGame />
    </div>
  );
}
