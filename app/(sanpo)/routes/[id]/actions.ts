import db from "@/db/drizzle";
import { routes } from "@/db/routesSchema";
import { eq } from "drizzle-orm";



// 特定のルート取得
export const fetchRouteById = async (id: string) => {
    const [route] = await db.select().from(routes).where(eq(routes.id, parseInt(id)));

  return route || null; // 結果がなければ null を返す
};
