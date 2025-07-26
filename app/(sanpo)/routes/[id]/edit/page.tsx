import { notFound } from "next/navigation";
import { fetchRouteById } from "./actions";
import EditForm from "./EditForm";

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface EditPageProps {
  params: {
    id: string;
  };
}

export default async function EditPage({ params }: EditPageProps) {
  const result = await fetchRouteById(params.id);

  if (!result.success || !result.route) {
    notFound();
  }

  const { route } = result;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-col gap-4 p-4">
        <EditForm route={route} params={params} />
      </div>
    </div>
  );
}
