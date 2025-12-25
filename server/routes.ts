import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { UserRole, SubscriptionPlan, tenants, users, projects, tasks, auditLogs } from "@shared/schema";
import { z } from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { sql } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Middleware to authenticate token
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    (req as any).user = user;
    next();
  });
}

// Middleware to check roles
function authorizeRoles(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
    }
    next();
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Auth Routes
  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);

      // Check for existing subdomain
      const existingTenant = await storage.getTenantBySubdomain(input.subdomain);
      if (existingTenant) {
        return res.status(409).json({ message: "Subdomain already taken" });
      }

      // Create Tenant
      const tenant = await storage.createTenant({
        name: input.tenantName,
        subdomain: input.subdomain,
        subscriptionPlan: SubscriptionPlan.FREE,
        status: 'active',
        maxUsers: 5,
        maxProjects: 3
      });

      // Create Admin User
      const hashedPassword = await bcrypt.hash(input.adminPassword, 10);
      const user = await storage.createUser({
        tenantId: tenant.id,
        email: input.adminEmail,
        passwordHash: hashedPassword,
        fullName: input.adminName,
        role: UserRole.TENANT_ADMIN,
        isActive: true
      });

      // Log action
      await storage.createAuditLog({
        tenantId: tenant.id,
        userId: user.id,
        action: 'REGISTER_TENANT',
        entityType: 'tenant',
        entityId: tenant.id,
        ipAddress: req.ip
      });

      const token = jwt.sign({ id: user.id, tenantId: tenant.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

      res.status(201).json({ token, user, tenant });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);

      let user;
      let tenant;

      if (input.subdomain) {
        tenant = await storage.getTenantBySubdomain(input.subdomain);
        if (!tenant) return res.status(401).json({ message: "Invalid subdomain" });
        user = await storage.getUserByTenantAndEmail(tenant.id, input.email);
      } else {
        // Fallback: Try to find a user by email directly
        user = await storage.getUserByEmail(input.email);
        if (user && user.tenantId) {
          tenant = await storage.getTenant(user.tenantId);
        }
      }

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // If user found but no tenant (Super Admin potentially), tenant remains undefined
      // If user has tenantId but we couldn't find tenant (shouldn't happen with FK), handle it.

      const validPassword = await bcrypt.compare(input.password, user.passwordHash);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id, tenantId: user.tenantId, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

      res.json({ token, user, tenant });
    } catch (err) {
       res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get(api.auth.me.path, authenticateToken, async (req: any, res) => {
    const user = await storage.getUser(req.user.id);
    if (!user) return res.status(401).json({ message: "User not found" });
    const tenant = user.tenantId ? await storage.getTenant(user.tenantId) : undefined;
    res.json({ user, tenant });
  });

  // Tenant Routes
  app.get(api.tenants.list.path, authenticateToken, authorizeRoles(UserRole.SUPER_ADMIN), async (req, res) => {
    const tenants = await storage.listTenants();
    res.json(tenants);
  });

  // User Routes
  app.get(api.users.list.path, authenticateToken, authorizeRoles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN), async (req: any, res) => {
    if (req.user.role === UserRole.SUPER_ADMIN) {
        // Implement list all users or just allow viewing specific tenant's users?
        // For now, let's just return users of the tenant if context is tenant, or all if no tenant?
        // Let's stick to tenant isolation for Tenant Admin.
        // Super Admin might want to see all users, but the API might be scoped.
        // Assuming current tenant context for simplicity if tenantId exists.
        if (req.user.tenantId) {
            const users = await storage.listUsers(req.user.tenantId);
            res.json(users);
        } else {
             // Super admin global list? Not implemented in storage yet.
             res.json([]);
        }
    } else {
        const users = await storage.listUsers(req.user.tenantId);
        res.json(users);
    }
  });

  app.post(api.users.create.path, authenticateToken, authorizeRoles(UserRole.TENANT_ADMIN), async (req: any, res) => {
    try {
      const input = api.users.create.input.parse(req.body);
      
      const tenant = await storage.getTenant(req.user.tenantId);
      const currentUsers = await storage.listUsers(req.user.tenantId);
      if (tenant && currentUsers.length >= tenant.maxUsers) {
        return res.status(403).json({ message: "User limit reached for current plan" });
      }

      const hashedPassword = await bcrypt.hash(input.passwordHash, 10);
      const user = await storage.createUser({
        ...input,
        passwordHash: hashedPassword,
        tenantId: req.user.tenantId,
      });

      await storage.createAuditLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: 'CREATE_USER',
        entityType: 'user',
        entityId: user.id,
        ipAddress: req.ip
      });

      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
          return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Error creating user" });
    }
  });

  // Project Routes
  app.get(api.projects.list.path, authenticateToken, async (req: any, res) => {
    const projects = await storage.listProjects(req.user.tenantId);
    res.json(projects);
  });

  app.post(api.projects.create.path, authenticateToken, async (req: any, res) => {
    try {
      const input = api.projects.create.input.parse(req.body);

      const tenant = await storage.getTenant(req.user.tenantId);
      const currentProjects = await storage.listProjects(req.user.tenantId);
      if (tenant && currentProjects.length >= tenant.maxProjects) {
        return res.status(403).json({ message: "Project limit reached for current plan" });
      }

      const project = await storage.createProject({
        ...input,
        tenantId: req.user.tenantId,
        createdBy: req.user.id
      });

      await storage.createAuditLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: 'CREATE_PROJECT',
        entityType: 'project',
        entityId: project.id,
        ipAddress: req.ip
      });

      res.status(201).json(project);
    } catch (err) {
      res.status(500).json({ message: "Error creating project" });
    }
  });

  app.get(api.projects.get.path, authenticateToken, async (req: any, res) => {
    const project = await storage.getProject(req.params.id);
    if (!project || project.tenantId !== req.user.tenantId) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  });

  // Task Routes
  app.get(api.tasks.list.path, authenticateToken, async (req: any, res) => {
    const projectId = req.query.projectId as string | undefined;
    const tasks = await storage.listTasks(req.user.tenantId, projectId);
    res.json(tasks);
  });

  app.post(api.tasks.create.path, authenticateToken, async (req: any, res) => {
    try {
      const input = api.tasks.create.input.parse(req.body);
      
      const project = await storage.getProject(input.projectId);
      if (!project || project.tenantId !== req.user.tenantId) {
        return res.status(404).json({ message: "Project not found" });
      }

      const task = await storage.createTask({
        ...input,
        tenantId: req.user.tenantId
      });

      await storage.createAuditLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: 'CREATE_TASK',
        entityType: 'task',
        entityId: task.id,
        ipAddress: req.ip
      });

      res.status(201).json(task);
    } catch (err) {
      res.status(500).json({ message: "Error creating task" });
    }
  });

  app.patch(api.tasks.update.path, authenticateToken, async (req: any, res) => {
    try {
      const input = api.tasks.update.input.parse(req.body);
      const task = await storage.getTask(req.params.id);
      if (!task || task.tenantId !== req.user.tenantId) {
        return res.status(404).json({ message: "Task not found" });
      }
      const updated = await storage.updateTask(req.params.id, input);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Error updating task" });
    }
  });

  app.get(api.health.check.path, async (req, res) => {
    try {
      await db.execute(sql`SELECT 1`);
      res.json({ status: "ok", database: "connected" });
    } catch (err) {
      res.status(500).json({ status: "error", database: "disconnected" });
    }
  });

  // SEED DATA on startup
  (async () => {
    try {
      const usersList = await storage.getUserByEmail("superadmin@platform.com");
      if (!usersList) {
        console.log("Seeding database...");
        
        // 0. Create Super Admin
        const superAdminHash = await bcrypt.hash("supersecret", 10);
        await storage.createUser({
          email: "superadmin@platform.com",
          passwordHash: superAdminHash,
          fullName: "System Administrator",
          role: UserRole.SUPER_ADMIN,
          isActive: true
          // tenantId left undefined/null
        });
        
        // 1. Create a Demo Tenant
        const tenant = await storage.createTenant({
          name: "Acme Corp",
          subdomain: "acme",
          subscriptionPlan: SubscriptionPlan.PRO,
          status: 'active',
          maxUsers: 25,
          maxProjects: 15
        });

        // 2. Create Tenant Admin
        const adminHash = await bcrypt.hash("admin123", 10);
        const admin = await storage.createUser({
          tenantId: tenant.id,
          email: "admin@acme.com",
          passwordHash: adminHash,
          fullName: "Acme Admin",
          role: UserRole.TENANT_ADMIN,
          isActive: true
        });

        // 3. Create Regular User
        const userHash = await bcrypt.hash("user123", 10);
        const user = await storage.createUser({
          tenantId: tenant.id,
          email: "user@acme.com",
          passwordHash: userHash,
          fullName: "Alice Worker",
          role: UserRole.USER,
          isActive: true
        });

        // 4. Create Project
        const project = await storage.createProject({
          tenantId: tenant.id,
          name: "Website Redesign",
          description: "Q4 Website Overhaul",
          status: 'active',
          createdBy: admin.id
        });

        // 5. Create Tasks
        await storage.createTask({
          tenantId: tenant.id,
          projectId: project.id,
          title: "Design Mockups",
          description: "Create Figma designs for homepage",
          status: 'in_progress',
          priority: 'high',
          assignedTo: user.id
        });

        console.log("Database seeded successfully!");
      }
    } catch (error) {
      console.error("Seeding failed:", error);
    }
  })();

  return httpServer;
}
