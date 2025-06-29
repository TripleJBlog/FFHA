import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Shield, Sword, Coins, Star } from "lucide-react";
import { useHero } from "@/lib/stores/useHero";

export default function HeroStats() {
  const { selectedHero } = useHero();

  if (!selectedHero) return null;

  const expProgress = (selectedHero.experience / selectedHero.experienceToNext) * 100;

  return (
    <Card className="bg-slate-700/50 border-slate-600">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Health */}
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            <div>
              <div className="text-xs text-slate-400">HP</div>
              <div className="text-sm font-bold text-white">
                {selectedHero.currentHealth}/{selectedHero.maxHealth}
              </div>
            </div>
          </div>

          {/* Attack */}
          <div className="flex items-center gap-2">
            <Sword className="w-4 h-4 text-orange-500" />
            <div>
              <div className="text-xs text-slate-400">ATK</div>
              <div className="text-sm font-bold text-white">
                {selectedHero.attack}
              </div>
            </div>
          </div>

          {/* Defense */}
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-500" />
            <div>
              <div className="text-xs text-slate-400">DEF</div>
              <div className="text-sm font-bold text-white">
                {selectedHero.defense}
              </div>
            </div>
          </div>

          {/* Gold */}
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-yellow-500" />
            <div>
              <div className="text-xs text-slate-400">Gold</div>
              <div className="text-sm font-bold text-white">
                {selectedHero.gold.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Experience Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-slate-400">
                Level {selectedHero.level}
              </span>
            </div>
            <span className="text-xs text-slate-400">
              {selectedHero.experience}/{selectedHero.experienceToNext} EXP
            </span>
          </div>
          <Progress 
            value={expProgress} 
            className="h-2 bg-slate-600"
          />
        </div>

        {/* Skill Points */}
        {selectedHero.skillPoints > 0 && (
          <div className="mt-3 p-2 bg-purple-600/20 border border-purple-500/30 rounded">
            <div className="text-xs text-purple-300 text-center">
              {selectedHero.skillPoints} Skill Points Available!
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
