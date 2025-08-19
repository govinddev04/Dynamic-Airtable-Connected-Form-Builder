import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { initiateAirtableAuth, handleAirtableCallback, getCurrentUser, logoutUser } from "./routes/auth";
import { getBases, getTables, getFields, createRecord, getRecords } from "./routes/airtable";
import { createForm, getForms, getForm, updateForm, deleteForm, getPublicForm } from "./routes/forms";
import { authenticateUser } from "./middleware/auth";
import { connectToDatabase } from "./database/connection";

export function createServer() {
  const app = express();

  // Initialize MongoDB connection
  connectToDatabase().catch(console.error);

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth routes
  app.get("/api/auth/airtable", initiateAirtableAuth);
  app.get("/api/auth/airtable/callback", handleAirtableCallback);
  app.get("/api/auth/me", getCurrentUser);
  app.post("/api/auth/logout", logoutUser);

  // Airtable API routes (protected)
  app.get("/api/airtable/bases", authenticateUser, getBases);
  app.get("/api/airtable/bases/:baseId/tables", authenticateUser, getTables);
  app.get("/api/airtable/bases/:baseId/tables/:tableId/fields", authenticateUser, getFields);
  app.get("/api/airtable/bases/:baseId/tables/:tableId/records", authenticateUser, getRecords);
  app.post("/api/airtable/bases/:baseId/tables/:tableId/records", authenticateUser, createRecord);

  // Form management routes (protected)
  app.post("/api/forms", authenticateUser, createForm);
  app.get("/api/forms", authenticateUser, getForms);
  app.get("/api/forms/:formId", authenticateUser, getForm);
  app.put("/api/forms/:formId", authenticateUser, updateForm);
  app.delete("/api/forms/:formId", authenticateUser, deleteForm);

  // Public form routes (no authentication required)
  app.get("/api/public/forms/:formId", getPublicForm);

  return app;
}
