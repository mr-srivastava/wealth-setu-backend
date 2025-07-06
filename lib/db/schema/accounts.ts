import { pgTable, text, timestamp, uuid, boolean, decimal, jsonb, index } from "drizzle-orm/pg-core";
import { users } from "./users";

// Financial accounts
export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // savings, checking, investment, credit, etc.
  balance: decimal("balance", { precision: 15, scale: 2 }).notNull().default("0.00"),
  currency: text("currency").notNull().default("USD"),
  accountNumber: text("account_number"),
  institution: text("institution"),
  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata"), // Additional account-specific data
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("accounts_user_id_idx").on(table.userId),
  typeIdx: index("accounts_type_idx").on(table.type),
})); 