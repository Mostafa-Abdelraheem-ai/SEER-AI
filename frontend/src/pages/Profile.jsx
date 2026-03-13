import { useAuth } from "../hooks/useAuth";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Profile</h1>
        <p className="mt-2 text-slate-500">Authenticated user details and role.</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-3 text-sm text-slate-700">
          <div>Name: {user?.full_name}</div>
          <div>Email: {user?.email}</div>
          <div>Role: {user?.role}</div>
          <div>User ID: {user?.id}</div>
        </div>
      </div>
    </div>
  );
}
