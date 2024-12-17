import Header from "@/components/header";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
     <>
            <Header/>
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </>
  );
}
