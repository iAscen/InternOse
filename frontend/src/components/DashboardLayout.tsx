import Header from "./Header";
import Footer from "./Footer";
import { MobileSidebarProvider } from "~/contexts/MobileSidebarContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {

  return (
    <MobileSidebarProvider>
      <div className="min-h-screen flex flex-col bg-slate-100">
        <Header />
        <div className="flex-1 bg-slate-100">
          {children}
        </div>
        <Footer />
      </div>
    </MobileSidebarProvider>
  );
}

