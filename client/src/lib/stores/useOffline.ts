import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useHero } from "./useHero";
import { useWorkshop } from "./useWorkshop";

interface OfflineRewards {
  offlineTime: number; // in seconds
  gold: number;
  experience: number;
  materials: Record<string, number>;
}

interface OfflineState {
  lastActiveTime: number;
  offlineRewards: OfflineRewards | null;
  showOfflineDialog: boolean;
  
  // Actions
  checkOfflineRewards: () => void;
  calculateOfflineRewards: (offlineTime: number, playerLevel: number) => OfflineRewards;
  collectOfflineRewards: (useAdBonus?: boolean) => void;
  closeOfflineDialog: () => void;
  watchAdForBonus: () => void;
}

export const useOffline = create<OfflineState>()(
  persist(
    (set, get) => ({
      lastActiveTime: Date.now(),
      offlineRewards: null,
      showOfflineDialog: false,

      checkOfflineRewards: () => {
        const { selectedHero } = useHero.getState();
        const { lastActiveTime, calculateOfflineRewards } = get();
        
        if (!selectedHero) return;

        const now = Date.now();
        const offlineTime = Math.floor((now - lastActiveTime) / 1000);
        
        // Only show rewards if offline for more than 5 minutes
        if (offlineTime > 300) {
          const rewards = calculateOfflineRewards(offlineTime, selectedHero.level);
          
          set({
            offlineRewards: rewards,
            showOfflineDialog: true,
            lastActiveTime: now
          });
        } else {
          set({ lastActiveTime: now });
        }
      },

      calculateOfflineRewards: (offlineTime: number, playerLevel: number) => {
        // Cap offline time to 8 hours (28800 seconds)
        const cappedTime = Math.min(offlineTime, 28800);
        
        // Calculate rewards per hour based on player level
        const goldPerHour = 50 + playerLevel * 10;
        const expPerHour = 100 + playerLevel * 20;
        
        const hours = cappedTime / 3600;
        
        // Apply diminishing returns for longer offline periods
        const efficiency = Math.max(0.3, 1 - (hours - 2) * 0.1);
        
        const gold = Math.floor(goldPerHour * hours * efficiency);
        const experience = Math.floor(expPerHour * hours * efficiency);
        
        // Random materials based on time offline
        const materials: Record<string, number> = {};
        const materialTypes = ["ironOre", "leather", "cloth", "wood"];
        
        materialTypes.forEach(material => {
          const chance = Math.min(0.8, hours * 0.2);
          if (Math.random() < chance) {
            materials[material] = Math.floor(Math.random() * Math.max(1, hours)) + 1;
          }
        });

        return {
          offlineTime: cappedTime,
          gold,
          experience,
          materials
        };
      },

      collectOfflineRewards: (useAdBonus = false) => {
        const { offlineRewards } = get();
        
        if (!offlineRewards) return;

        const { gainGold, gainExperience } = useHero.getState();
        const { addMaterials } = useWorkshop.getState();
        
        const multiplier = useAdBonus ? 2.0 : 1.0;
        
        // Apply rewards
        gainGold(Math.floor(offlineRewards.gold * multiplier));
        gainExperience(Math.floor(offlineRewards.experience * multiplier));
        
        if (Object.keys(offlineRewards.materials).length > 0) {
          const multipliedMaterials = Object.fromEntries(
            Object.entries(offlineRewards.materials).map(([key, value]) => [
              key,
              Math.floor(value * multiplier)
            ])
          );
          addMaterials(multipliedMaterials);
        }

        set({
          offlineRewards: null,
          showOfflineDialog: false
        });
      },

      closeOfflineDialog: () => {
        set({ showOfflineDialog: false });
      },

      watchAdForBonus: () => {
        // Simulate watching an ad
        const adDuration = 30000; // 30 seconds
        
        // For MVP, we'll just simulate the ad completion
        setTimeout(() => {
          get().collectOfflineRewards(true);
        }, 1000); // Simulate instant ad completion for demo
      }
    }),
    {
      name: "offline-storage",
      partialize: (state) => ({ lastActiveTime: state.lastActiveTime })
    }
  )
);

// Update last active time periodically while app is active
setInterval(() => {
  useOffline.setState({ lastActiveTime: Date.now() });
}, 30000); // Update every 30 seconds
