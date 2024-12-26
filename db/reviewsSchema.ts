import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { users } from "./usersSchema";
import { routes } from "./routesSchema";
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  createdBy: text("user_name"),
  routeId: integer("route_id").references(() => routes.id, {
    onDelete: "cascade",
  }),
  author: integer("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
});
