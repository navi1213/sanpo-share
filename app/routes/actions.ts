import db from "@/db/drizzle";
import { routes } from "@/db/routesSchema";

export const fetchRoutes = async () =>{
    const allRoutes = await db
    .select()
    .from(routes)
    return allRoutes
}