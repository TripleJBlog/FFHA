import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sword, Shield, Shirt, Plus, Star } from "lucide-react";
import { useEquipment } from "@/lib/stores/useEquipment";
import { useHero } from "@/lib/stores/useHero";
import { EQUIPMENT_SLOTS, RARITY_COLORS } from "@/lib/gameConstants";
import type { Equipment } from "@/lib/stores/useEquipment";

export default function Equipment() {
  const { equippedItems, inventory, equipItem, unequipItem, enhanceEquipment } = useEquipment();
  const { selectedHero } = useHero();
  const [selectedSlot, setSelectedSlot] = useState<string>("weapon");

  if (!selectedHero) return null;

  const getSlotIcon = (slot: string) => {
    switch (slot) {
      case "weapon":
        return <Sword className="w-5 h-5" />;
      case "armor":
        return <Shirt className="w-5 h-5" />;
      case "shield":
        return <Shield className="w-5 h-5" />;
      default:
        return <Plus className="w-5 h-5" />;
    }
  };

  const getItemsForSlot = (slot: string) => {
    return inventory.filter((item) => item.slot === slot);
  };

  const canEnhance = (item: Equipment) => {
    const enhanceCost = (item.enhanceLevel + 1) * 100;
    return selectedHero.gold >= enhanceCost && item.enhanceLevel < 10;
  };

  const handleEnhance = (item: Equipment) => {
    const enhanceCost = (item.enhanceLevel + 1) * 100;
    if (canEnhance(item)) {
      enhanceEquipment(item.id, enhanceCost);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Equipment Slots */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Equipped Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {EQUIPMENT_SLOTS.map((slot) => {
            const equippedItem = equippedItems[slot.id];
            return (
              <div
                key={slot.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedSlot === slot.id
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-slate-600 hover:border-slate-500"
                }`}
                onClick={() => setSelectedSlot(slot.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-slate-400">
                      {getSlotIcon(slot.id)}
                    </div>
                    <div>
                      <div className="font-medium text-white">{slot.name}</div>
                      {equippedItem ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-300">
                              {equippedItem.name}
                            </span>
                            <Badge
                              className={`text-xs ${RARITY_COLORS[equippedItem.rarity]}`}
                            >
                              {equippedItem.rarity}
                            </Badge>
                            {equippedItem.enhanceLevel > 0 && (
                              <Badge variant="outline" className="text-xs">
                                +{equippedItem.enhanceLevel}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">
                            ATK: +{equippedItem.stats.attack} | DEF: +{equippedItem.stats.defense}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-slate-500">Empty</div>
                      )}
                    </div>
                  </div>
                  {equippedItem && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEnhance(equippedItem);
                        }}
                        disabled={!canEnhance(equippedItem)}
                        className="text-xs"
                      >
                        <Star className="w-3 h-3 mr-1" />
                        Enhance
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          unequipItem(slot.id);
                        }}
                        className="text-xs"
                      >
                        Unequip
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Inventory */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Inventory - {EQUIPMENT_SLOTS.find(s => s.id === selectedSlot)?.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getItemsForSlot(selectedSlot).length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No items available for this slot
              </div>
            ) : (
              getItemsForSlot(selectedSlot).map((item) => (
                <Card
                  key={item.id}
                  className="bg-slate-700/50 border-slate-600 hover:bg-slate-600/50 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-white">
                            {item.name}
                          </span>
                          <Badge
                            className={`text-xs ${RARITY_COLORS[item.rarity]}`}
                          >
                            {item.rarity}
                          </Badge>
                          {item.enhanceLevel > 0 && (
                            <Badge variant="outline" className="text-xs">
                              +{item.enhanceLevel}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-slate-400 space-y-1">
                          <div>ATK: +{item.stats.attack} | DEF: +{item.stats.defense}</div>
                          <div>HP: +{item.stats.health}</div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          onClick={() => equipItem(item.id)}
                          className="text-xs"
                        >
                          Equip
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEnhance(item)}
                          disabled={!canEnhance(item)}
                          className="text-xs"
                        >
                          <Star className="w-3 h-3 mr-1" />
                          Enhance
                        </Button>
                      </div>
                    </div>
                    {item.enhanceLevel < 10 && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Enhancement Level</span>
                          <span>{item.enhanceLevel}/10</span>
                        </div>
                        <Progress 
                          value={(item.enhanceLevel / 10) * 100} 
                          className="h-1"
                        />
                        <div className="text-xs text-slate-500 mt-1">
                          Next enhancement: {(item.enhanceLevel + 1) * 100} gold
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
