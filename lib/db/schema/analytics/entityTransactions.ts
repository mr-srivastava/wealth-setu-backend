import { pgTable, timestamp, uuid, decimal, index, date } from "drizzle-orm/pg-core";
import { entities } from "./entities";

// Entity transactions (monthly amounts for each entity)
export const entityTransactions = pgTable("entity_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  entityId: uuid("entity_id").references(() => entities.id, { onDelete: "cascade" }).notNull(),
  month: date("month").notNull(), // e.g., "2025-04-01" for Apr/2025
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(), // e.g., 104976.24
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  entityIdIdx: index("entity_transactions_entity_id_idx").on(table.entityId),
  monthIdx: index("entity_transactions_month_idx").on(table.month),
  createdAtIdx: index("entity_transactions_created_at_idx").on(table.createdAt),
  entityIdMonthIdx: index("entity_transactions_entity_id_month_idx").on(table.entityId, table.month),
})); 