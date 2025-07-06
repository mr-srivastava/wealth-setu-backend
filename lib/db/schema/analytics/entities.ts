import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { entityTypes } from "./entityTypes";

// Entities (e.g., "ICICI Mutual Fund", "Kotak", etc.)
export const entities = pgTable("entities", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(), // e.g., "ICICI Mutual Fund", "Kotak"
  typeId: uuid("type_id").references(() => entityTypes.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  typeIdIdx: index("entities_type_id_idx").on(table.typeId),
  nameIdx: index("entities_name_idx").on(table.name),
  createdAtIdx: index("entities_created_at_idx").on(table.createdAt),
})); 