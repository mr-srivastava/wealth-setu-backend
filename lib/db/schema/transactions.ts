import { pgTable, text, timestamp, uuid, decimal, jsonb, index } from "drizzle-orm/pg-core";
import { accounts } from "./accounts";

// Transactions
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id").references(() => accounts.id, { onDelete: "cascade" }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  type: text("type").notNull(), // income, expense, transfer
  category: text("category"),
  subcategory: text("subcategory"),
  description: text("description"),
  date: timestamp("date").notNull(),
  reference: text("reference"), // External reference number
  tags: text("tags").array(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  accountIdIdx: index("transactions_account_id_idx").on(table.accountId),
  dateIdx: index("transactions_date_idx").on(table.date),
  typeIdx: index("transactions_type_idx").on(table.type),
})); 