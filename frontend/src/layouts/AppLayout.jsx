import Navbar from "../components/Navbar";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen md:flex">
      <Navbar />
      <main className="flex-1 px-4 py-4 md:px-8 md:py-8">
        <div className="mx-auto max-w-7xl animate-fade-up">{children}</div>
      </main>
    </div>
  );
}
