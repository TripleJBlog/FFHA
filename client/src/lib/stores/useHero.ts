import { create } from "zustand";
import { persist } from "zustand/middleware";
import { HERO_CLASSES } from "../gameConstants";

export interface Hero {
  id: string;
  name: string;
  class: string;
  level: number;
  experience: number;
  experienceToNext: number;
  skillPoints: number;
  
  // Stats
  maxHealth: number;
  currentHealth: number;
  attack: number;
  defense: number;
  
  // Resources
  gold: number;
  
  // Skills
  skills: Record<string, number>;
  
  // Timestamps
  createdAt: number;
  lastActive: number;
}

interface HeroState {
  selectedHero: Hero | null;
  
  // Actions
  createHero: (name: string, heroClass: string) => void;
  loadHeroData: () => void;
  updateHero: (updates: Partial<Hero>) => void;
  gainExperience: (amount: number) => void;
  gainGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  takeDamage: (amount: number) => void;
  heal: (amount?: number) => void;
  levelUp: () => void;
}

export const useHero = create<HeroState>()(
  persist(
    (set, get) => ({
      selectedHero: null,

      createHero: (name: string, heroClass: string) => {
        const classData = HERO_CLASSES.find(c => c.name === heroClass);
        if (!classData) return;

        const hero: Hero = {
          id: `hero_${Date.now()}`,
          name,
          class: heroClass,
          level: 1,
          experience: 0,
          experienceToNext: 100,
          skillPoints: 0,
          
          maxHealth: classData.baseStats.health,
          currentHealth: classData.baseStats.health,
          attack: classData.baseStats.attack,
          defense: classData.baseStats.defense,
          
          gold: 100, // Starting gold
          
          skills: {},
          
          createdAt: Date.now(),
          lastActive: Date.now()
        };

        set({ selectedHero: hero });
      },

      loadHeroData: () => {
        // Hero data is automatically loaded from persistence
        const { selectedHero } = get();
        if (selectedHero) {
          // Update last active time only if it's been more than 30 seconds
          const now = Date.now();
          if (now - selectedHero.lastActive > 30000) {
            set({
              selectedHero: {
                ...selectedHero,
                lastActive: now
              }
            });
          }
        }
      },

      updateHero: (updates: Partial<Hero>) => {
        const { selectedHero } = get();
        if (!selectedHero) return;

        set({
          selectedHero: {
            ...selectedHero,
            ...updates,
            lastActive: Date.now()
          }
        });
      },

      gainExperience: (amount: number) => {
        const { selectedHero } = get();
        if (!selectedHero) return;

        console.log(`Gaining ${amount} XP. Current: ${selectedHero.experience}/${selectedHero.experienceToNext}`);

        let newExp = selectedHero.experience + amount;
        let newLevel = selectedHero.level;
        let skillPoints = selectedHero.skillPoints;
        let expToNext = selectedHero.experienceToNext;

        // Check for level ups
        while (newExp >= expToNext) {
          newExp -= expToNext;
          newLevel++;
          skillPoints++;
          expToNext = newLevel * 100; // Simple formula: level * 100
          console.log(`Level up! New level: ${newLevel}`);
        }

        // Calculate stat increases on level up
        let newAttack = selectedHero.attack;
        let newDefense = selectedHero.defense;
        let newMaxHealth = selectedHero.maxHealth;

        if (newLevel > selectedHero.level) {
          const levelIncrease = newLevel - selectedHero.level;
          const classData = HERO_CLASSES.find(c => c.name === selectedHero.class);
          
          if (classData) {
            newAttack += levelIncrease * 3;
            newDefense += levelIncrease * 2;
            newMaxHealth += levelIncrease * 10;
          }
        }

        set({
          selectedHero: {
            ...selectedHero,
            level: newLevel,
            experience: newExp,
            experienceToNext: expToNext,
            skillPoints,
            attack: newAttack,
            defense: newDefense,
            maxHealth: newMaxHealth,
            currentHealth: newMaxHealth, // Full heal on level up
            lastActive: Date.now()
          }
        });
      },

      gainGold: (amount: number) => {
        const { selectedHero } = get();
        if (!selectedHero) return;

        console.log(`Gaining ${amount} gold. Current: ${selectedHero.gold}`);

        set({
          selectedHero: {
            ...selectedHero,
            gold: selectedHero.gold + amount,
            lastActive: Date.now()
          }
        });

        console.log(`New gold total: ${selectedHero.gold + amount}`);
      },

      spendGold: (amount: number) => {
        const { selectedHero } = get();
        if (!selectedHero || selectedHero.gold < amount) return false;

        set({
          selectedHero: {
            ...selectedHero,
            gold: selectedHero.gold - amount,
            lastActive: Date.now()
          }
        });

        return true;
      },

      takeDamage: (amount: number) => {
        const { selectedHero } = get();
        if (!selectedHero) return;

        const newHealth = Math.max(0, selectedHero.currentHealth - amount);
        
        set({
          selectedHero: {
            ...selectedHero,
            currentHealth: newHealth,
            lastActive: Date.now()
          }
        });
      },

      heal: (amount?: number) => {
        const { selectedHero } = get();
        if (!selectedHero) return;

        const healAmount = amount || selectedHero.maxHealth;
        const newHealth = Math.min(selectedHero.maxHealth, selectedHero.currentHealth + healAmount);
        
        set({
          selectedHero: {
            ...selectedHero,
            currentHealth: newHealth,
            lastActive: Date.now()
          }
        });
      },

      levelUp: () => {
        const { gainExperience } = get();
        const { selectedHero } = get();
        if (!selectedHero) return;
        
        gainExperience(selectedHero.experienceToNext - selectedHero.experience);
      }
    }),
    {
      name: "hero-storage",
      partialize: (state) => ({ selectedHero: state.selectedHero })
    }
  )
);
