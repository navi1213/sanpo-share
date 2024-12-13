import Header from "@/components/header";

export default async function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <div>
        <header>
          <Header/>
        </header>
        {children}
      </div>
    );
  }