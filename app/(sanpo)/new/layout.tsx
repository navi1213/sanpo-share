import { auth } from "@/auth";
import { redirect } from "next/navigation";
export default async function LoggedInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?redirect=/new")
  }
  return (
    <>
      <div className="min-h-screen flex flex-col">
        {children}
      </div>
    </>
  );
}