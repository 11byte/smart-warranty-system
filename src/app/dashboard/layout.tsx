import { ReactNode } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  return (
    <div className="flex bg-gray-950 min-h-screen text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
