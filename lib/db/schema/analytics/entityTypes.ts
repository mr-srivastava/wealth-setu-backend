import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Entity types (e.g., "Mutual Fund", "Stock", "Bond", etc.)
export const entityTypes = pgTable("entity_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(), // e.g., "Mutual Fund", "Stock"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}); 