import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Coins, Star, Package, Clock, PlayCircle } from "lucide-react";
import { useOffline } from "@/lib/stores/useOffline";
import { useAudio } from "@/lib/stores/useAudio";

export default function OfflineRewards() {
  const { 
    offlineRewards, 
    showOfflineDialog, 
    closeOfflineDialog, 
    collectOfflineRewards,
    watchAdForBonus 
  } = useOffline();
  const { playSuccess } = useAudio();

  const handleCollectRewards = (useAd = false) => {
    collectOfflineRewards(useAd);
    playSuccess();
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!showOfflineDialog || !offlineRewards) return null;

  const bonusMultiplier = 2.0; // 2x bonus for watching ad
  const bonusRewards = {
    gold: Math.floor(offlineRewards.gold * bonusMultiplier),
    experience: Math.floor(offlineRewards.experience * bonusMultiplier),
    materials: Object.fromEntries(
      Object.entries(offlineRewards.materials || {}).map(([key, value]) => [
        key, 
        Math.floor(value * bonusMultiplier)
      ])
    )
  };

  return (
    <Dialog open={showOfflineDialog} onOpenChange={closeOfflineDialog}>
      <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2 text-xl">
            <Clock className="w-6 h-6 text-purple-500" />
            Welcome Back, Hero!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-sm text-slate-400">
              You were away for
            </div>
            <div className="text-lg font-bold text-purple-400">
              {formatTime(offlineRewards.offlineTime)}
            </div>
          </div>

          <Card className="bg-slate-700/50 border-slate-600">
            <CardContent className="p-4">
              <div className="text-center mb-3">
                <h3 className="font-bold text-white">Offline Rewards</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="text-slate-300">Gold</span>
                  </div>
                  <span className="font-bold text-yellow-400">
                    +{offlineRewards.gold.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-purple-500" />
                    <span className="text-slate-300">Experience</span>
                  </div>
                  <span className="font-bold text-purple-400">
                    +{offlineRewards.experience.toLocaleString()}
                  </span>
                </div>

                {offlineRewards.materials && Object.keys(offlineRewards.materials).length > 0 && (
                  <div className="pt-2 border-t border-slate-600">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-green-500" />
                      <span className="text-slate-300 text-sm">Materials</span>
                    </div>
                    <div className="space-y-1">
                      {Object.entries(offlineRewards.materials).map(([material, amount]) => (
                        <div key={material} className="flex justify-between text-sm">
                          <span className="text-slate-400 capitalize">
                            {material}:
                          </span>
                          <span className="text-green-400">+{amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ad bonus preview */}
          <Card className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-600/50">
            <CardContent className="p-3">
              <div className="text-center mb-2">
                <div className="text-sm text-green-400 font-medium">
                  Watch Ad for 2x Bonus!
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Gold:</span>
                  <span className="text-yellow-400 font-bold">
                    +{bonusRewards.gold.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">EXP:</span>
                  <span className="text-purple-400 font-bold">
                    +{bonusRewards.experience.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleCollectRewards(false)}
              variant="outline"
              className="border-slate-600 hover:bg-slate-700"
            >
              Collect
            </Button>
            <Button
              onClick={() => watchAdForBonus()}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              Watch Ad (2x)
            </Button>
          </div>

          <div className="text-xs text-center text-slate-500">
            Your hero continued training while you were away!
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
