import Navbar from "../components/Navbar";

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Navbar />
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
