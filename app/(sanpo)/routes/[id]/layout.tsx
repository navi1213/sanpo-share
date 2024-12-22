import { auth } from "@/auth";


export default async function LoggedOutLayout({children}:{children:React.ReactNode}) {
    const session = await auth();
    
    return <>
    <div className="min-h-screen flex flex-col">
      {children}
    </div>
  </>
}