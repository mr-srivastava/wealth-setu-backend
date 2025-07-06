import { pgTable, text, timestamp, uuid, boolean, decimal, index } from "drizzle-orm/pg-core";
import { users } from "./users";

// Goals
export const goals = pgTable("goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  targetAmount: decimal("target_amount", { precision: 15, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 15, scale: 2 }).notNull().default("0.00"),
  targetDate: timestamp("target_date"),
  category: text("category"),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("goals_user_id_idx").on(table.userId),
  categoryIdx: index("goals_category_idx").on(table.category),
})); 