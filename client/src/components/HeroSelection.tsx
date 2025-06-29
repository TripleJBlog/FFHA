import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sword, Shield, Zap } from "lucide-react";
import { useHero } from "@/lib/stores/useHero";
import { HERO_CLASSES } from "@/lib/gameConstants";

export default function HeroSelection() {
  const [heroName, setHeroName] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const { createHero } = useHero();

  const handleCreateHero = () => {
    if (!heroName.trim() || !selectedClass) return;
    
    createHero(heroName.trim(), selectedClass);
  };

  const getClassIcon = (className: string) => {
    switch (className) {
      case "Warrior":
        return <Sword className="w-8 h-8" />;
      case "Guardian":
        return <Shield className="w-8 h-8" />;
      case "Mage":
        return <Zap className="w-8 h-8" />;
      default:
        return <Sword className="w-8 h-8" />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-slate-800/90 border-slate-700 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white mb-2">
            Immortal Front: Age of Heroes
          </CardTitle>
          <CardDescription className="text-slate-300 text-lg">
            Choose your hero and begin your legendary journey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Hero Name Input */}
          <div className="space-y-2">
            <Label htmlFor="heroName" className="text-white">
              Hero Name
            </Label>
            <Input
              id="heroName"
              value={heroName}
              onChange={(e) => setHeroName(e.target.value)}
              placeholder="Enter your hero's name"
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              maxLength={20}
            />
          </div>

          {/* Class Selection */}
          <div className="space-y-4">
            <Label className="text-white text-lg">Choose Your Class</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {HERO_CLASSES.map((heroClass) => (
                <Card
                  key={heroClass.name}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedClass === heroClass.name
                      ? "bg-blue-600/50 border-blue-400 ring-2 ring-blue-400"
                      : "bg-slate-700/50 border-slate-600 hover:bg-slate-600/50"
                  }`}
                  onClick={() => setSelectedClass(heroClass.name)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="flex justify-center mb-3 text-white">
                      {getClassIcon(heroClass.name)}
                    </div>
                    <h3 className="font-bold text-white mb-2">
                      {heroClass.name}
                    </h3>
                    <p className="text-sm text-slate-300 mb-3">
                      {heroClass.description}
                    </p>
                    <div className="space-y-1 text-xs text-slate-400">
                      <div>ATK: {heroClass.baseStats.attack}</div>
                      <div>DEF: {heroClass.baseStats.defense}</div>
                      <div>HP: {heroClass.baseStats.health}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Create Hero Button */}
          <div className="pt-4">
            <Button
              onClick={handleCreateHero}
              disabled={!heroName.trim() || !selectedClass}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 text-lg"
            >
              Begin Your Journey
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
