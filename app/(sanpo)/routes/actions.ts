import db from "@/db/drizzle";
import { reviews } from "@/db/reviewsSchema";
import { routes } from "@/db/routesSchema";
import { eq } from "drizzle-orm";

export const fetchRoutes = async () => {
  const allRoutes = await db.select().from(routes);
  return allRoutes;
};
export const fetchReviewByRouteId = async (id: string) => {
  const review = await db
    .select()
    .from(reviews)
    .where(eq(reviews.routeId, parseInt(id)));
  return review;
};
