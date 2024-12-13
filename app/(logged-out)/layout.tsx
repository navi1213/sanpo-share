import { auth } from "@/auth";
import Header from "@/components/header";
import { redirect } from "next/navigation";

export default async function LoggedOutLayout({children}:{children:React.ReactNode}) {
    const session = await auth();
    if(!!session?.user?.id) {
        redirect("/my-account")
    }
    return <>
    <div className="min-h-screen flex flex-col">
        <Header/>
      {children}
    </div>
  </>
}