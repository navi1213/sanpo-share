import { pgTable, text, json, serial, integer } from "drizzle-orm/pg-core";
import { users } from "./usersSchema";
import { routes } from "./routesSchema";
export const reviews = pgTable("routes", {
  id: serial("id").primaryKey(),
  content: text("name").notNull(),
  createdBy: text("user_name"),
  route: integer("route_id").references(() => routes.id, {
    onDelete: "cascade",
  }),
  author: integer("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
});
