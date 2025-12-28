import type { Express } from "express";
import { createServer, type Server } from "http";
import { createProxyMiddleware } from "http-proxy-middleware";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Proxy all /api requests to the backend
  if (!process.env.BACKEND_URL) {
    throw new Error('BACKEND_URL environment variable is required');
  }
  app.use('/api', createProxyMiddleware({
    target: process.env.BACKEND_URL,
    changeOrigin: true,
    secure: true,
    pathRewrite: { '^/': '/api/' },
    logger: console,
  }));

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
