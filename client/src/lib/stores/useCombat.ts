import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useHero } from "./useHero";
import { useWorkshop } from "./useWorkshop";

export interface Enemy {
  id: string;
  name: string;
  level: number;
  type: string;
  maxHealth: number;
  currentHealth: number;
  attack: number;
  defense: number;
  rewards: {
    experience: number;
    gold: number;
    materials?: Record<string, number>;
  };
}

export interface CombatLog {
  id: string;
  type: "damage" | "victory" | "defeat" | "heal" | "levelup";
  message: string;
  timestamp: number;
}

interface IdleStats {
  totalIdleTime: number;
  enemiesDefeated: number;
  totalExperience: number;
  totalGold: number;
  pendingRewards: {
    experience: number;
    gold: number;
    materials: Record<string, number>;
  };
}

interface CombatState {
  isIdle: boolean;
  currentEnemy: Enemy | null;
  combatLog: CombatLog[];
  idleStats: IdleStats;
  lastIdleUpdate: number;
  
  // Actions
  startIdleCombat: () => void;
  stopIdleCombat: () => void;
  generateEnemy: (playerLevel: number) => Enemy;
  processCombat: () => void;
  collectIdleRewards: () => void;
  addCombatLog: (log: Omit<CombatLog, "id" | "timestamp">) => void;
  updateIdleProgress: () => void;
}

export const useCombat = create<CombatState>()(
  persist(
    (set, get) => ({
      isIdle: false,
      currentEnemy: null,
      combatLog: [],
      idleStats: {
        totalIdleTime: 0,
        enemiesDefeated: 0,
        totalExperience: 0,
        totalGold: 0,
        pendingRewards: {
          experience: 0,
          gold: 0,
          materials: {}
        }
      },
      lastIdleUpdate: Date.now(),

      startIdleCombat: () => {
        const { selectedHero } = useHero.getState();
        if (!selectedHero) return;

        const { generateEnemy, addCombatLog } = get();
        const enemy = generateEnemy(selectedHero.level);

        set({
          isIdle: true,
          currentEnemy: enemy,
          lastIdleUpdate: Date.now()
        });

        addCombatLog({
          type: "damage",
          message: `Started combat with ${enemy.name}!`
        });
      },

      stopIdleCombat: () => {
        const { addCombatLog } = get();
        
        set({
          isIdle: false,
          currentEnemy: null
        });

        addCombatLog({
          type: "damage",
          message: "Stopped idle combat."
        });
      },

      generateEnemy: (playerLevel: number) => {
        const enemyTypes = [
          { name: "Goblin", type: "Monster", multiplier: 0.8 },
          { name: "Orc", type: "Monster", multiplier: 1.0 },
          { name: "Skeleton", type: "Undead", multiplier: 0.9 },
          { name: "Wolf", type: "Beast", multiplier: 0.7 },
          { name: "Bandit", type: "Human", multiplier: 1.1 },
          { name: "Troll", type: "Monster", multiplier: 1.3 },
          { name: "Dark Mage", type: "Magic", multiplier: 1.2 }
        ];

        const enemyTemplate = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        const level = Math.max(1, playerLevel + Math.floor((Math.random() - 0.5) * 3));
        
        const baseHealth = 80 + level * 15;
        const baseAttack = 8 + level * 2;
        const baseDefense = 5 + level * 1;

        const health = Math.floor(baseHealth * enemyTemplate.multiplier);
        const attack = Math.floor(baseAttack * enemyTemplate.multiplier);
        const defense = Math.floor(baseDefense * enemyTemplate.multiplier);

        return {
          id: `enemy_${Date.now()}`,
          name: `${enemyTemplate.name} (Lv.${level})`,
          level,
          type: enemyTemplate.type,
          maxHealth: health,
          currentHealth: health,
          attack,
          defense,
          rewards: {
            experience: 10, // Fixed 10 XP per monster
            gold: 10, // Fixed 10 gold per monster
            materials: Math.random() < 0.3 ? {
              [["ironOre", "leather", "cloth", "wood"][Math.floor(Math.random() * 4)]]: 1
            } : {}
          }
        };
      },

      processCombat: () => {
        const { selectedHero } = useHero.getState();
        const { currentEnemy, generateEnemy, addCombatLog } = get();
        
        if (!selectedHero || !currentEnemy) return;

        // Determine combat actions (attack, defense, evasion)
        const playerAction = Math.random();
        const enemyAction = Math.random();
        
        let playerDamage = 0;
        let enemyDamage = 0;
        let combatMessages = [];

        // Player's turn
        if (playerAction < 0.7) { // 70% chance to attack
          const baseDamage = Math.max(1, selectedHero.attack - Math.floor(currentEnemy.defense / 2));
          playerDamage = Math.max(1, baseDamage + Math.floor(Math.random() * 5) - 2);
          
          if (Math.random() < 0.1) { // 10% critical hit
            playerDamage = Math.floor(playerDamage * 1.5);
            combatMessages.push(`💥 CRITICAL HIT! You deal ${playerDamage} damage to ${currentEnemy.name}!`);
          } else {
            combatMessages.push(`⚔️ You attack ${currentEnemy.name} for ${playerDamage} damage!`);
          }
        } else if (playerAction < 0.85) { // 15% chance to defend
          combatMessages.push(`🛡️ You raise your guard and prepare to defend!`);
        } else { // 15% chance to evade
          combatMessages.push(`💨 You attempt to evade the next attack!`);
        }

        // Apply player damage to enemy
        const newEnemyHealth = Math.max(0, currentEnemy.currentHealth - playerDamage);
        
        // Update enemy health immediately
        set((state) => ({
          currentEnemy: state.currentEnemy ? {
            ...state.currentEnemy,
            currentHealth: newEnemyHealth
          } : null
        }));

        // Check if enemy is still alive for counterattack
        if (newEnemyHealth > 0) {
          // Enemy's turn
          if (enemyAction < 0.75) { // 75% chance to attack
            const baseEnemyDamage = Math.max(1, currentEnemy.attack - Math.floor(selectedHero.defense / 2));
            enemyDamage = Math.max(1, baseEnemyDamage + Math.floor(Math.random() * 3) - 1);
            
            // Check if player was defending or evading
            const playerWasDefending = playerAction >= 0.7 && playerAction < 0.85;
            const playerWasEvading = playerAction >= 0.85;
            
            if (playerWasEvading && Math.random() < 0.3) { // 30% evasion success
              combatMessages.push(`💨 You successfully evade ${currentEnemy.name}'s attack!`);
              enemyDamage = 0;
            } else if (playerWasDefending) {
              enemyDamage = Math.floor(enemyDamage * 0.5); // Reduce damage by 50%
              combatMessages.push(`🛡️ You block some damage! ${currentEnemy.name} deals ${enemyDamage} damage!`);
            } else {
              if (Math.random() < 0.05) { // 5% enemy critical
                enemyDamage = Math.floor(enemyDamage * 1.3);
                combatMessages.push(`💀 ${currentEnemy.name} lands a critical hit for ${enemyDamage} damage!`);
              } else {
                combatMessages.push(`⚔️ ${currentEnemy.name} attacks you for ${enemyDamage} damage!`);
              }
            }
            
            // Apply enemy damage to hero
            if (enemyDamage > 0) {
              const { takeDamage } = useHero.getState();
              takeDamage(enemyDamage);
            }
            
          } else { // 25% chance enemy defends or prepares
            combatMessages.push(`🛡️ ${currentEnemy.name} prepares to defend!`);
          }
        }

        // Add all combat messages
        combatMessages.forEach(message => {
          addCombatLog({
            type: "damage",
            message
          });
        });
        
        if (newEnemyHealth <= 0) {
          // Enemy defeated - apply rewards directly to hero state
          console.log(`Enemy defeated: ${currentEnemy.name}, rewards:`, currentEnemy.rewards);
          
          const { gainExperience, gainGold } = useHero.getState();
          
          // Apply experience which handles level ups
          gainExperience(currentEnemy.rewards.experience);
          
          // Apply gold directly
          gainGold(currentEnemy.rewards.gold);

          // Add materials if any
          if (currentEnemy.rewards.materials) {
            const { addMaterials } = useWorkshop.getState();
            addMaterials(currentEnemy.rewards.materials);
          }

          // Update idle stats
          set((state) => ({
            idleStats: {
              ...state.idleStats,
              enemiesDefeated: state.idleStats.enemiesDefeated + 1,
              totalExperience: state.idleStats.totalExperience + currentEnemy.rewards.experience,
              totalGold: state.idleStats.totalGold + currentEnemy.rewards.gold,
              pendingRewards: {
                experience: state.idleStats.pendingRewards.experience + currentEnemy.rewards.experience,
                gold: state.idleStats.pendingRewards.gold + currentEnemy.rewards.gold,
                materials: {
                  ...state.idleStats.pendingRewards.materials,
                  ...Object.fromEntries(
                    Object.entries(currentEnemy.rewards.materials || {}).map(([key, value]) => [
                      key,
                      (state.idleStats.pendingRewards.materials[key] || 0) + value
                    ])
                  )
                }
              }
            }
          }));

          addCombatLog({
            type: "victory",
            message: `🏆 Victory! Defeated ${currentEnemy.name}! Gained ${currentEnemy.rewards.experience} EXP and ${currentEnemy.rewards.gold} gold!`
          });

          // Show materials gained if any
          if (currentEnemy.rewards.materials && Object.keys(currentEnemy.rewards.materials).length > 0) {
            const materialsList = Object.entries(currentEnemy.rewards.materials)
              .map(([material, amount]) => `${amount} ${material}`)
              .join(', ');
            addCombatLog({
              type: "victory",
              message: `📦 Materials gained: ${materialsList}`
            });
          }

          // Generate new enemy
          if (selectedHero) {
            const newEnemy = generateEnemy(selectedHero.level);
            set({ currentEnemy: newEnemy });
          }

        } else {
          // Check if player was defeated
          const { selectedHero: updatedHero } = useHero.getState();
          if (updatedHero && updatedHero.currentHealth <= 0) {
            // Player defeated, stop combat and start recovery
            get().stopIdleCombat();
            
            addCombatLog({
              type: "defeat",
              message: `💀 Defeated by ${currentEnemy.name}! Recovering in 5 seconds...`
            });
            
            // 5-second delay before full recovery
            setTimeout(() => {
              const { heal } = useHero.getState();
              heal(); // Full heal (no amount = max health)
              
              const { addCombatLog } = get();
              addCombatLog({
                type: "heal",
                message: `❤️ You have fully recovered and are ready for combat!`
              });
            }, 5000);
          }
        }
      },

      collectIdleRewards: () => {
        const { idleStats } = get();
        
        if (idleStats.pendingRewards.gold === 0 && idleStats.pendingRewards.experience === 0) return;

        // Clear pending rewards
        set((state) => ({
          idleStats: {
            ...state.idleStats,
            pendingRewards: {
              experience: 0,
              gold: 0,
              materials: {}
            }
          }
        }));

        const { addCombatLog } = get();
        addCombatLog({
          type: "victory",
          message: `Collected idle rewards: ${idleStats.pendingRewards.gold} gold, ${idleStats.pendingRewards.experience} EXP!`
        });
      },

      addCombatLog: (log) => {
        const newLog: CombatLog = {
          ...log,
          id: `log_${Date.now()}_${Math.random()}`,
          timestamp: Date.now()
        };

        set((state) => ({
          combatLog: [...state.combatLog.slice(-49), newLog] // Keep last 50 logs
        }));
      },

      updateIdleProgress: () => {
        const { isIdle, lastIdleUpdate } = get();
        
        if (!isIdle) return;

        const now = Date.now();
        const timeDelta = now - lastIdleUpdate;
        
        // Update idle time
        set((state) => ({
          idleStats: {
            ...state.idleStats,
            totalIdleTime: state.idleStats.totalIdleTime + Math.floor(timeDelta / 1000)
          },
          lastIdleUpdate: now
        }));

        // Process combat every 500ms for fast-paced action
        if (timeDelta >= 500) {
          get().processCombat();
          set({ lastIdleUpdate: now });
        }
      }
    }),
    {
      name: "combat-storage"
    }
  )
);

// Update idle progress every second
setInterval(() => {
  useCombat.getState().updateIdleProgress();
}, 1000);