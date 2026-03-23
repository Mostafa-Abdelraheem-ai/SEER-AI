import { useAuth } from "../hooks/useAuth";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-700">Identity</p>
        <h1 className="mt-3 text-4xl font-black text-slate-950">Profile</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">Authenticated user details and role context for the current analyst session.</p>
      </div>
      <div className="glass-panel rounded-[30px] p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Name</div>
            <div className="mt-2 text-sm font-semibold text-slate-900">{user?.full_name}</div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Email</div>
            <div className="mt-2 text-sm font-semibold text-slate-900">{user?.email}</div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Role</div>
            <div className="mt-2 text-sm font-semibold text-slate-900">{user?.role}</div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">User ID</div>
            <div className="mt-2 text-sm font-semibold text-slate-900 break-all">{user?.id}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
