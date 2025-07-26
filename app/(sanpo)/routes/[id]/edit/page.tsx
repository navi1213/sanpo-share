import { fetchRouteById } from "./actions";
import EditForm from "./EditForm";
import { notFound } from "next/navigation";

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface EditPageProps {
  params: {
    id: string;
  };
}

export default async function EditPage({ params }: EditPageProps) {
  console.log('📝 EditPage: ルート編集ページ開始', { routeId: params.id });
  
  const route = await fetchRouteById(params.id);
  
  if (!route) {
    console.log('📝 EditPage: ルートが見つかりません', { routeId: params.id });
    notFound();
  }

  console.log('📝 EditPage: ルートデータ取得成功', {
    routeId: route.id,
    routeName: route.name,
    pathLength: route.path?.length || 0,
    timestamp: new Date().toISOString()
  });

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-col gap-4 p-4">
        <EditForm route={route} params={params} />
      </div>
    </div>
  );
}
