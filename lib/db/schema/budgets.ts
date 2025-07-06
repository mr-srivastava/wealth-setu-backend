import { pgTable, text, timestamp, uuid, boolean, decimal, index } from "drizzle-orm/pg-core";
import { users } from "./users";

// Budgets
export const budgets = pgTable("budgets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  period: text("period").notNull(), // monthly, yearly, etc.
  category: text("category"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("budgets_user_id_idx").on(table.userId),
  periodIdx: index("budgets_period_idx").on(table.period),
})); 