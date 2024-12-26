export default async function RoutesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {
    id: string;
  };
}) {
  return (
    <>
      <div className="min-h-screen flex flex-col">{children}</div>
    </>
  );
}
