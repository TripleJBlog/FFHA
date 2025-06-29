import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Swords, Play, Pause, RotateCcw, Coins, Star, Heart, Shield } from "lucide-react";
import { useCombat } from "@/lib/stores/useCombat";
import { useHero } from "@/lib/stores/useHero";

export default function Combat() {
  const { 
    isIdle, 
    currentEnemy, 
    combatLog, 
    idleStats,
    startIdleCombat, 
    stopIdleCombat, 
    collectIdleRewards 
  } = useCombat();
  const { selectedHero } = useHero();
  const [autoCollect, setAutoCollect] = useState(true);

  useEffect(() => {
    // Auto-collect rewards every 30 seconds if enabled
    if (autoCollect && idleStats.pendingRewards.gold > 0) {
      const interval = setInterval(() => {
        collectIdleRewards();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoCollect, idleStats.pendingRewards.gold, collectIdleRewards]);

  if (!selectedHero) return null;

  const handleToggleIdle = () => {
    if (isIdle) {
      stopIdleCombat();
    } else {
      startIdleCombat();
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Idle Combat Control */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Swords className="w-5 h-5" />
            Idle Combat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Combat Status */}
          <div className="text-center">
            <div className={`text-lg font-bold mb-2 ${
              isIdle ? "text-green-400" : "text-red-400"
            }`}>
              {isIdle ? "ACTIVE" : "INACTIVE"}
            </div>
            <div className="space-y-2">
              <Button
                onClick={handleToggleIdle}
                className={`w-full ${
                  isIdle 
                    ? "bg-red-600 hover:bg-red-700" 
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isIdle ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Stop Combat
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Combat
                  </>
                )}
              </Button>
              
              {/* Manual Attack Button for Testing */}
              {isIdle && currentEnemy && (
                <Button
                  onClick={() => {
                    const { processCombat } = useCombat.getState();
                    processCombat();
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <Swords className="w-4 h-4 mr-2" />
                  Manual Attack
                </Button>
              )}
            </div>
          </div>

          {/* Hero vs Enemy Display */}
          {currentEnemy && (
            <div className="space-y-4">
              {/* Hero Status */}
              <Card className="bg-blue-800/30 border-blue-600">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Heart className="w-5 h-5 text-red-400" />
                    <div>
                      <div className="font-bold text-white">
                        {selectedHero.name} (Level {selectedHero.level})
                      </div>
                      <div className="text-sm text-blue-400">
                        {selectedHero.class}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Health:</span>
                      <span className="text-green-400">
                        {selectedHero.currentHealth}/{selectedHero.maxHealth}
                      </span>
                    </div>
                    <Progress 
                      value={(selectedHero.currentHealth / selectedHero.maxHealth) * 100}
                      className="h-3 bg-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3 text-xs">
                    <div className="text-center">
                      <div className="text-slate-400">ATK</div>
                      <div className="font-bold text-orange-400">
                        {selectedHero.attack}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-400">DEF</div>
                      <div className="font-bold text-blue-400">
                        {selectedHero.defense}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* VS Indicator */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-red-600/20 px-4 py-2 rounded-full border border-red-500/50">
                  <Swords className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 font-bold">VS</span>
                  <Swords className="w-4 h-4 text-red-400" />
                </div>
              </div>

              {/* Enemy Status */}
              <Card className="bg-red-800/30 border-red-600">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-bold text-white">
                        {currentEnemy.name}
                      </div>
                      <div className="text-sm text-slate-400">
                        Level {currentEnemy.level}
                      </div>
                    </div>
                    <Badge className="bg-red-600">
                      {currentEnemy.type}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Health:</span>
                      <span className={`font-bold ${
                        currentEnemy.currentHealth / currentEnemy.maxHealth > 0.5 
                          ? 'text-red-400' 
                          : 'text-red-300'
                      }`}>
                        {currentEnemy.currentHealth}/{currentEnemy.maxHealth}
                      </span>
                    </div>
                    <Progress 
                      value={(currentEnemy.currentHealth / currentEnemy.maxHealth) * 100}
                      className="h-3 bg-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3 text-xs">
                    <div className="text-center">
                      <div className="text-slate-400">ATK</div>
                      <div className="font-bold text-orange-400">
                        {currentEnemy.attack}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-400">DEF</div>
                      <div className="font-bold text-blue-400">
                        {currentEnemy.defense}
                      </div>
                    </div>
                  </div>

                  {/* Rewards Preview */}
                  <div className="mt-3 pt-3 border-t border-slate-600">
                    <div className="text-xs text-slate-400 mb-1">Rewards:</div>
                    <div className="flex justify-between text-xs">
                      <span className="text-yellow-400">
                        {currentEnemy.rewards.gold} Gold
                      </span>
                      <span className="text-purple-400">
                        {currentEnemy.rewards.experience} XP
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Idle Statistics */}
          <Card className="bg-slate-700/50 border-slate-600">
            <CardContent className="p-4">
              <div className="text-center mb-3">
                <div className="text-sm text-slate-400">Idle Time</div>
                <div className="text-lg font-bold text-purple-400">
                  {formatTime(idleStats.totalIdleTime)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="text-center">
                  <div className="text-slate-400">Enemies Defeated</div>
                  <div className="font-bold text-green-400">
                    {idleStats.enemiesDefeated}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-slate-400">Total Experience</div>
                  <div className="font-bold text-blue-400">
                    {idleStats.totalExperience.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Rewards & Combat Log */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Rewards & Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pending Rewards */}
          <Card className="bg-slate-700/50 border-slate-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-white">Pending Rewards</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setAutoCollect(!autoCollect)}
                    className="text-xs"
                  >
                    Auto: {autoCollect ? "ON" : "OFF"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={collectIdleRewards}
                    disabled={idleStats.pendingRewards.gold === 0}
                    className="text-xs"
                  >
                    Collect
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span className="text-slate-400">Gold:</span>
                  <span className="font-bold text-yellow-400">
                    {idleStats.pendingRewards.gold.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-purple-500" />
                  <span className="text-slate-400">EXP:</span>
                  <span className="font-bold text-purple-400">
                    {idleStats.pendingRewards.experience.toLocaleString()}
                  </span>
                </div>
              </div>

              {idleStats.pendingRewards.materials && Object.keys(idleStats.pendingRewards.materials).length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-600">
                  <div className="text-xs text-slate-400 mb-2">Materials:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(idleStats.pendingRewards.materials).map(([material, amount]) => (
                      <div key={material} className="flex justify-between">
                        <span className="text-slate-300 capitalize">
                          {material}:
                        </span>
                        <span className="text-green-400">+{amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Combat Log */}
          <Card className="bg-slate-700/50 border-slate-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-white">Combat Log</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {/* Clear log logic */}}
                  className="text-xs"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {combatLog.length === 0 ? (
                  <div className="text-center text-slate-500 py-4">
                    No combat activity yet
                  </div>
                ) : (
                  combatLog.slice(-10).reverse().map((log, index) => (
                    <div
                      key={index}
                      className={`text-xs p-2 rounded ${
                        log.type === 'victory' ? 'bg-green-900/30 text-green-300' :
                        log.type === 'defeat' ? 'bg-red-900/30 text-red-300' :
                        log.type === 'damage' ? 'bg-orange-900/30 text-orange-300' :
                        'bg-slate-600/30 text-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span>{log.message}</span>
                        <span className="text-slate-500 ml-2">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
