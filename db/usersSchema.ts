import { boolean, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("user_name").unique().notNull(),
  email: text("email").unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  twoFactorSecret: text("2fa_secret"),
  twoFactorActivated: boolean("2fa_activated").default(false),
});
