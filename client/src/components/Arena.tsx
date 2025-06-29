import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Sword, Medal, ShoppingCart, Clock } from "lucide-react";
import { useArena } from "@/lib/stores/useArena";
import { useHero } from "@/lib/stores/useHero";
import { HONOR_SHOP_ITEMS } from "@/lib/gameConstants";

export default function Arena() {
  const { 
    playerRank, 
    honorPoints, 
    currentOpponent, 
    battleInProgress, 
    battleResult,
    leaderboard,
    findOpponent, 
    startBattle, 
    buyHonorItem,
    clearBattleResult 
  } = useArena();
  const { selectedHero } = useHero();
  const [selectedTab, setSelectedTab] = useState("battle");

  useEffect(() => {
    // Clear battle result after 5 seconds
    if (battleResult) {
      const timeout = setTimeout(() => {
        clearBattleResult();
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [battleResult, clearBattleResult]);

  if (!selectedHero) return null;

  const handleFindOpponent = () => {
    findOpponent(selectedHero.level, playerRank);
  };

  const handleStartBattle = () => {
    if (currentOpponent) {
      startBattle(selectedHero, currentOpponent);
    }
  };

  const handleBuyItem = (item: any) => {
    if (honorPoints >= item.cost) {
      buyHonorItem(item);
    }
  };

  const getRankName = (rank: number) => {
    if (rank <= 100) return "Champion";
    if (rank <= 500) return "Master";
    if (rank <= 1000) return "Expert";
    if (rank <= 2000) return "Veteran";
    return "Novice";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Arena Status */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Arena Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-slate-700/50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">
                #{playerRank}
              </div>
              <div className="text-sm text-slate-400">Rank</div>
            </div>
            <div className="text-center p-3 bg-slate-700/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">
                {honorPoints}
              </div>
              <div className="text-sm text-slate-400">Honor</div>
            </div>
          </div>

          <div className="text-center p-3 bg-slate-700/50 rounded-lg">
            <Badge className="bg-gradient-to-r from-yellow-600 to-orange-600">
              {getRankName(playerRank)}
            </Badge>
          </div>

          {/* Battle Result */}
          {battleResult && (
            <Card className={`border-2 ${
              battleResult.victory 
                ? "border-green-500 bg-green-500/10"
                : "border-red-500 bg-red-500/10"
            }`}>
              <CardContent className="p-4 text-center">
                <div className={`text-lg font-bold ${
                  battleResult.victory ? "text-green-400" : "text-red-400"
                }`}>
                  {battleResult.victory ? "VICTORY!" : "DEFEAT"}
                </div>
                <div className="text-sm text-slate-300 mt-2">
                  Honor: {battleResult.honorGained > 0 ? "+" : ""}{battleResult.honorGained}
                </div>
                <div className="text-sm text-slate-300">
                  Rank: {battleResult.rankChange > 0 ? "+" : ""}{battleResult.rankChange}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Battle */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sword className="w-5 h-5" />
            Ranked Battle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!currentOpponent ? (
            <div className="text-center py-8">
              <Button 
                onClick={handleFindOpponent}
                disabled={battleInProgress}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                Find Opponent
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Card className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                        <Sword className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-white">
                          {currentOpponent.name}
                        </div>
                        <div className="text-sm text-slate-400">
                          Level {currentOpponent.level} {currentOpponent.class}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">
                      Rank #{currentOpponent.rank}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-slate-400">ATK</div>
                      <div className="font-bold text-orange-400">
                        {currentOpponent.attack}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-400">DEF</div>
                      <div className="font-bold text-blue-400">
                        {currentOpponent.defense}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-400">HP</div>
                      <div className="font-bold text-red-400">
                        {currentOpponent.health}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button
                  onClick={handleStartBattle}
                  disabled={battleInProgress}
                  className="flex-1 bg-gradient-to-r from-red-600 to-orange-600"
                >
                  {battleInProgress ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Battling...
                    </>
                  ) : (
                    <>
                      <Sword className="w-4 h-4 mr-2" />
                      Start Battle
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleFindOpponent}
                  disabled={battleInProgress}
                  variant="outline"
                >
                  New Opponent
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Honor Shop & Leaderboard */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex space-x-4">
            <button
              onClick={() => setSelectedTab("shop")}
              className={`flex items-center gap-2 px-3 py-2 rounded ${
                selectedTab === "shop"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              Honor Shop
            </button>
            <button
              onClick={() => setSelectedTab("leaderboard")}
              className={`flex items-center gap-2 px-3 py-2 rounded ${
                selectedTab === "leaderboard"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Medal className="w-4 h-4" />
              Leaderboard
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {selectedTab === "shop" ? (
            <div className="space-y-3">
              {HONOR_SHOP_ITEMS.map((item) => (
                <Card
                  key={item.id}
                  className="bg-slate-700/50 border-slate-600 hover:bg-slate-600/50 transition-colors"
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">
                        {item.name}
                      </span>
                      <Badge className="bg-purple-600">
                        {item.cost} Honor
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-400 mb-3">
                      {item.description}
                    </div>
                    <Button
                      onClick={() => handleBuyItem(item)}
                      disabled={honorPoints < item.cost}
                      className="w-full"
                      size="sm"
                    >
                      Purchase
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.slice(0, 10).map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    player.id === selectedHero.id
                      ? "bg-blue-600/20 border border-blue-600/50"
                      : "bg-slate-700/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? "bg-yellow-500 text-black" :
                      index === 1 ? "bg-gray-400 text-black" :
                      index === 2 ? "bg-orange-600 text-white" :
                      "bg-slate-600 text-white"
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {player.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        Level {player.level}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-purple-400">
                      {player.honor}
                    </div>
                    <div className="text-xs text-slate-400">
                      Honor
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
