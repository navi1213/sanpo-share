export default async function LoggedOutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="min-h-screen flex flex-col">{children}</div>
    </>
  );
}
