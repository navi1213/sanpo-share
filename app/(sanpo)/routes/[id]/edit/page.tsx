import { auth } from "@/auth";
import { fetchRouteById } from "./actions";
import EditForm from "./EditForm";
import { redirect } from "next/navigation";

type RouteProps = {
  params: {
    id: string; // 動的ルートで渡される ID
  };
};
export default async function Edit({ params }: RouteProps) {
  const route = await fetchRouteById(params.id);
  const session = await auth();
  if (parseInt(session?.user?.id) !== route.author) {
    redirect(`/routes/${params.id}`);
  }
  return (
    <>
      <EditForm route={route} />
    </>
  );
}
