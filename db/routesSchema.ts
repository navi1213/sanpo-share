import { pgTable, text, json, serial, integer } from "drizzle-orm/pg-core";
import { users } from "./usersSchema";

export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  location: text("location"),
  path: json("path").notNull(),
  distance: text("distance").notNull(),
  createdBy: text("user_name"),
  author: integer("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
});
