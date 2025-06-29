import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Sword, Shield, Hammer, Trophy, User } from "lucide-react";
import HeroSelection from "./HeroSelection";
import HeroStats from "./HeroStats";
import Equipment from "./Equipment";
import Workshop from "./Workshop";
import Arena from "./Arena";
import Combat from "./Combat";
import OfflineRewards from "./OfflineRewards";
import { useHero } from "@/lib/stores/useHero";
import { useOffline } from "@/lib/stores/useOffline";
import { useCombat } from "@/lib/stores/useCombat";

export default function Game() {
  const { selectedHero, loadHeroData } = useHero();
  const { checkOfflineRewards } = useOffline();
  const { startIdleCombat } = useCombat();

  useEffect(() => {
    // Initialize game data on load
    loadHeroData();
    checkOfflineRewards();
    
    // Start idle combat if hero is selected
    if (selectedHero) {
      startIdleCombat();
    }
  }, [loadHeroData, checkOfflineRewards, startIdleCombat, selectedHero]);

  // Show hero selection if no hero is selected
  if (!selectedHero) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <HeroSelection />
        <OfflineRewards />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header with hero info */}
        <Card className="mb-4 p-4 bg-slate-800/50 border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {selectedHero.name}
                </h1>
                <p className="text-sm text-slate-300">
                  Level {selectedHero.level} {selectedHero.class}
                </p>
              </div>
            </div>
            <HeroStats />
          </div>
        </Card>

        {/* Main game tabs */}
        <Tabs defaultValue="combat" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border-slate-700">
            <TabsTrigger 
              value="combat" 
              className="flex items-center gap-2 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
            >
              <Sword className="w-4 h-4" />
              <span className="hidden sm:inline">Combat</span>
            </TabsTrigger>
            <TabsTrigger 
              value="equipment" 
              className="flex items-center gap-2 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Equipment</span>
            </TabsTrigger>
            <TabsTrigger 
              value="workshop" 
              className="flex items-center gap-2 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
            >
              <Hammer className="w-4 h-4" />
              <span className="hidden sm:inline">Workshop</span>
            </TabsTrigger>
            <TabsTrigger 
              value="arena" 
              className="flex items-center gap-2 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Arena</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="combat" className="mt-4">
            <Combat />
          </TabsContent>

          <TabsContent value="equipment" className="mt-4">
            <Equipment />
          </TabsContent>

          <TabsContent value="workshop" className="mt-4">
            <Workshop />
          </TabsContent>

          <TabsContent value="arena" className="mt-4">
            <Arena />
          </TabsContent>
        </Tabs>

        <OfflineRewards />
      </div>
    </div>
  );
}
