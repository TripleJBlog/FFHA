import { users, type User, type InsertUser, type Hero } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getHero(id: string): Promise<Hero | undefined>;
  createHero(hero: Hero): Promise<Hero>;
  updateHero(id: string, updates: Partial<Hero>): Promise<Hero | undefined>;
  getPlayerMaterials(heroId: string): Promise<Record<string, number>>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private heroes: Map<string, Hero>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.heroes = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email ?? null,
      createdAt: new Date(),
      lastLogin: null
    };
    this.users.set(id, user);
    return user;
  }

  async getHero(id: string): Promise<Hero | undefined> {
    return this.heroes.get(id);
  }

  async createHero(hero: Hero): Promise<Hero> {
    this.heroes.set(hero.id, hero);
    return hero;
  }

  async updateHero(id: string, updates: Partial<Hero>): Promise<Hero | undefined> {
    const hero = this.heroes.get(id);
    if (!hero) return undefined;
    
    const updatedHero = { ...hero, ...updates };
    this.heroes.set(id, updatedHero);
    return updatedHero;
  }

  async getPlayerMaterials(heroId: string): Promise<Record<string, number>> {
    const hero = this.heroes.get(heroId);
    return hero?.materials || {};
  }
}

export const storage = new MemStorage();
