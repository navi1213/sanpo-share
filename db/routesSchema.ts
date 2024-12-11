import { pgTable, text, json, integer,serial } from "drizzle-orm/pg-core";
import { users } from "./usersSchema"
// ルート情報を保存するテーブル
// 修正後のスキーマ
export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  location: text("location"),
  path: json("path").notNull(),
  createdBy: integer("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
});


