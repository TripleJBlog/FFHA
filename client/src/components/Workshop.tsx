import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hammer, Package, Clock, Zap } from "lucide-react";
import { useWorkshop } from "@/lib/stores/useWorkshop";
import { useHero } from "@/lib/stores/useHero";
import { CRAFTABLE_ITEMS, RARITY_COLORS } from "@/lib/gameConstants";

export default function Workshop() {
  const { 
    craftingQueue, 
    materials, 
    startCrafting, 
    finishCrafting, 
    skipCrafting 
  } = useWorkshop();
  const { selectedHero } = useHero();
  const [selectedCategory, setSelectedCategory] = useState("weapons");

  if (!selectedHero) return null;

  const canCraft = (recipe: any) => {
    if (selectedHero.gold < recipe.goldCost) return false;
    return recipe.materials.every((req: any) => 
      materials[req.type] >= req.amount
    );
  };

  const handleCraft = (recipe: any) => {
    if (canCraft(recipe)) {
      startCrafting(recipe);
    }
  };

  const handleFinish = (id: string) => {
    finishCrafting(id);
  };

  const handleSkip = (id: string, cost: number) => {
    if (selectedHero.gold >= cost) {
      skipCrafting(id, cost);
    }
  };

  const getCraftableItems = (category: string) => {
    return CRAFTABLE_ITEMS.filter(item => item.category === category);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Crafting Queue */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Crafting Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          {craftingQueue.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No items being crafted
            </div>
          ) : (
            <div className="space-y-3">
              {craftingQueue.map((item) => {
                const timeRemaining = Math.max(0, item.finishTime - Date.now());
                const progress = ((item.craftTime - timeRemaining) / item.craftTime) * 100;
                const isFinished = timeRemaining === 0;
                const skipCost = Math.ceil(timeRemaining / 1000) * 10;

                return (
                  <Card key={item.id} className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">
                          {item.itemName}
                        </span>
                        <Badge className={RARITY_COLORS[item.rarity]}>
                          {item.rarity}
                        </Badge>
                      </div>
                      
                      {!isFinished ? (
                        <>
                          <Progress value={progress} className="mb-2" />
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">
                              {Math.ceil(timeRemaining / 1000)}s remaining
                            </span>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSkip(item.id, skipCost)}
                                disabled={selectedHero.gold < skipCost}
                                className="text-xs"
                              >
                                <Zap className="w-3 h-3 mr-1" />
                                Skip ({skipCost}g)
                              </Button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <Button
                          onClick={() => handleFinish(item.id)}
                          className="w-full"
                          size="sm"
                        >
                          Collect Item
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Materials */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Package className="w-5 h-5" />
            Materials
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(materials).map(([material, amount]) => (
              <div
                key={material}
                className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600"
              >
                <span className="text-white capitalize">
                  {material.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <Badge variant="secondary">
                  {amount}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Crafting Recipes */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Hammer className="w-5 h-5" />
            Craft Equipment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-3 bg-slate-700">
              <TabsTrigger value="weapons">Weapons</TabsTrigger>
              <TabsTrigger value="armor">Armor</TabsTrigger>
              <TabsTrigger value="shields">Shields</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-4">
              <div className="space-y-3">
                {getCraftableItems(selectedCategory).map((recipe) => (
                  <Card
                    key={recipe.id}
                    className="bg-slate-700/50 border-slate-600 hover:bg-slate-600/50 transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">
                            {recipe.name}
                          </span>
                          <Badge className={RARITY_COLORS[recipe.rarity]}>
                            {recipe.rarity}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-400">
                          {Math.ceil(recipe.craftTime / 1000)}s
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="text-sm text-slate-400">
                          ATK: +{recipe.stats.attack} | DEF: +{recipe.stats.defense} | HP: +{recipe.stats.health}
                        </div>
                        
                        <div className="text-xs text-slate-500">
                          <div>Gold: {recipe.goldCost}</div>
                          <div>Materials:</div>
                          <ul className="ml-4 space-y-1">
                            {recipe.materials.map((req: any, index: number) => (
                              <li
                                key={index}
                                className={
                                  materials[req.type] >= req.amount
                                    ? "text-green-400"
                                    : "text-red-400"
                                }
                              >
                                {req.type}: {req.amount} ({materials[req.type] || 0} available)
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleCraft(recipe)}
                        disabled={!canCraft(recipe)}
                        className="w-full"
                        size="sm"
                      >
                        <Hammer className="w-4 h-4 mr-2" />
                        Craft
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
