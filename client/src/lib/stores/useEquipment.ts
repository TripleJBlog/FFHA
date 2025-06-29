import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useHero } from "./useHero";

export interface Equipment {
  id: string;
  name: string;
  slot: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  enhanceLevel: number;
  stats: {
    attack: number;
    defense: number;
    health: number;
  };
  acquiredAt: number;
}

interface EquipmentState {
  inventory: Equipment[];
  equippedItems: Record<string, Equipment>;
  
  // Actions
  addEquipment: (equipment: Omit<Equipment, "id" | "acquiredAt">) => void;
  equipItem: (equipmentId: string) => void;
  unequipItem: (slot: string) => void;
  enhanceEquipment: (equipmentId: string, goldCost: number) => void;
  removeEquipment: (equipmentId: string) => void;
  getEquippedStats: () => { attack: number; defense: number; health: number };
}

export const useEquipment = create<EquipmentState>()(
  persist(
    (set, get) => ({
      inventory: [],
      equippedItems: {},

      addEquipment: (equipment) => {
        const newEquipment: Equipment = {
          ...equipment,
          id: `eq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          acquiredAt: Date.now()
        };

        set((state) => ({
          inventory: [...state.inventory, newEquipment]
        }));
      },

      equipItem: (equipmentId: string) => {
        const { inventory, equippedItems } = get();
        const equipment = inventory.find(eq => eq.id === equipmentId);
        
        if (!equipment) return;

        // Unequip current item in slot if exists
        const currentEquipped = equippedItems[equipment.slot];
        const updatedInventory = [...inventory];
        
        if (currentEquipped) {
          // Add current equipped item back to inventory
          updatedInventory.push(currentEquipped);
        }

        // Remove new equipment from inventory
        const newInventory = updatedInventory.filter(eq => eq.id !== equipmentId);

        set({
          inventory: newInventory,
          equippedItems: {
            ...equippedItems,
            [equipment.slot]: equipment
          }
        });

        // Update hero stats
        const { updateHero } = useHero.getState();
        const stats = get().getEquippedStats();
        updateHero({
          attack: stats.attack,
          defense: stats.defense,
          maxHealth: stats.health
        });
      },

      unequipItem: (slot: string) => {
        const { equippedItems } = get();
        const equipment = equippedItems[slot];
        
        if (!equipment) return;

        const newEquippedItems = { ...equippedItems };
        delete newEquippedItems[slot];

        set((state) => ({
          inventory: [...state.inventory, equipment],
          equippedItems: newEquippedItems
        }));

        // Update hero stats
        const { updateHero } = useHero.getState();
        const stats = get().getEquippedStats();
        updateHero({
          attack: stats.attack,
          defense: stats.defense,
          maxHealth: stats.health
        });
      },

      enhanceEquipment: (equipmentId: string, goldCost: number) => {
        const { spendGold } = useHero.getState();
        
        if (!spendGold(goldCost)) return;

        set((state) => {
          // Check equipped items first
          const updatedEquippedItems = { ...state.equippedItems };
          let found = false;

          for (const [slot, equipment] of Object.entries(updatedEquippedItems)) {
            if (equipment.id === equipmentId) {
              updatedEquippedItems[slot] = {
                ...equipment,
                enhanceLevel: equipment.enhanceLevel + 1,
                stats: {
                  attack: equipment.stats.attack + 2,
                  defense: equipment.stats.defense + 2,
                  health: equipment.stats.health + 5
                }
              };
              found = true;
              break;
            }
          }

          // Check inventory if not found in equipped items
          const updatedInventory = state.inventory.map(equipment => {
            if (equipment.id === equipmentId) {
              found = true;
              return {
                ...equipment,
                enhanceLevel: equipment.enhanceLevel + 1,
                stats: {
                  attack: equipment.stats.attack + 2,
                  defense: equipment.stats.defense + 2,
                  health: equipment.stats.health + 5
                }
              };
            }
            return equipment;
          });

          return {
            inventory: found ? updatedInventory : state.inventory,
            equippedItems: updatedEquippedItems
          };
        });

        // Update hero stats if equipped item was enhanced
        const { updateHero } = useHero.getState();
        const stats = get().getEquippedStats();
        updateHero({
          attack: stats.attack,
          defense: stats.defense,
          maxHealth: stats.health
        });
      },

      removeEquipment: (equipmentId: string) => {
        set((state) => ({
          inventory: state.inventory.filter(eq => eq.id !== equipmentId)
        }));
      },

      getEquippedStats: () => {
        const { equippedItems } = get();
        const { selectedHero } = useHero.getState();
        
        if (!selectedHero) {
          return { attack: 0, defense: 0, health: 0 };
        }

        // Get base stats from hero class
        const baseStats = {
          attack: selectedHero.attack - Object.values(equippedItems).reduce((sum, eq) => sum + eq.stats.attack, 0),
          defense: selectedHero.defense - Object.values(equippedItems).reduce((sum, eq) => sum + eq.stats.defense, 0),
          health: selectedHero.maxHealth - Object.values(equippedItems).reduce((sum, eq) => sum + eq.stats.health, 0)
        };

        // Add equipment bonuses
        const equipmentStats = Object.values(equippedItems).reduce(
          (total, equipment) => ({
            attack: total.attack + equipment.stats.attack,
            defense: total.defense + equipment.stats.defense,
            health: total.health + equipment.stats.health
          }),
          { attack: 0, defense: 0, health: 0 }
        );

        return {
          attack: baseStats.attack + equipmentStats.attack,
          defense: baseStats.defense + equipmentStats.defense,
          health: baseStats.health + equipmentStats.health
        };
      }
    }),
    {
      name: "equipment-storage"
    }
  )
);
