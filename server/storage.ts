import { 
  users, tenants, projects, tasks, auditLogs,
  type User, type Tenant, type Project, type Task, type AuditLog,
  type InsertUser, type InsertTenant, type InsertProject, type InsertTask
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Tenants
  getTenant(id: string): Promise<Tenant | undefined>;
  getTenantBySubdomain(subdomain: string): Promise<Tenant | undefined>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  listTenants(): Promise<Tenant[]>;

  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>; // Global search for login
  getUserByTenantAndEmail(tenantId: string, email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  listUsers(tenantId: string): Promise<User[]>;

  // Projects
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  listProjects(tenantId: string): Promise<Project[]>;

  // Tasks
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  listTasks(tenantId: string, projectId?: string): Promise<Task[]>;

  // Audit Logs
  createAuditLog(log: any): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Tenants
  async getTenant(id: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant;
  }

  async getTenantBySubdomain(subdomain: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.subdomain, subdomain));
    return tenant;
  }

  async createTenant(insertTenant: InsertTenant): Promise<Tenant> {
    const [tenant] = await db.insert(tenants).values(insertTenant).returning();
    return tenant;
  }

  async listTenants(): Promise<Tenant[]> {
    return db.select().from(tenants);
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    // Note: This returns the first user found. In a real multi-tenant app with same email in multiple tenants,
    // we'd need tenant context. For login, we might need to ask for subdomain or return all.
    // However, the schema has uniqueIndex on (tenantId, email).
    // Let's assume for global login (super admin) or just finding 'a' user.
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByTenantAndEmail(tenantId: string, email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(
      and(eq(users.tenantId, tenantId), eq(users.email, email))
    );
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async listUsers(tenantId: string): Promise<User[]> {
    return db.select().from(users).where(eq(users.tenantId, tenantId));
  }

  // Projects
  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project> {
    const [project] = await db.update(projects).set(updates).where(eq(projects.id, id)).returning();
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  async listProjects(tenantId: string): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.tenantId, tenantId));
  }

  // Tasks
  async getTask(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(insertTask).returning();
    return task;
  }

  async updateTask(id: string, updates: Partial<InsertTask>): Promise<Task> {
    const [task] = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    return task;
  }

  async deleteTask(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async listTasks(tenantId: string, projectId?: string): Promise<Task[]> {
    if (projectId) {
      return db.select().from(tasks).where(
        and(eq(tasks.tenantId, tenantId), eq(tasks.projectId, projectId))
      ).orderBy(desc(tasks.createdAt));
    }
    return db.select().from(tasks).where(eq(tasks.tenantId, tenantId)).orderBy(desc(tasks.createdAt));
  }

  // Audit Logs
  async createAuditLog(log: any): Promise<void> {
    await db.insert(auditLogs).values(log);
  }
}

export const storage = new DatabaseStorage();
