import db from "@/db/drizzle";
import { reviews } from "@/db/reviewsSchema";
import { routes } from "@/db/routesSchema";
import { eq } from "drizzle-orm";

export const fetchRoutes = async () => {
  try {
    const allRoutes = await db.select().from(routes);
    return allRoutes;
  } catch (error) {
    console.error('fetchRoutes: エラー', error);
    return [];
  }
};
export const fetchReviewByRouteId = async (id: string) => {
  const review = await db
    .select()
    .from(reviews)
    .where(eq(reviews.routeId, parseInt(id)));
  return review;
};
