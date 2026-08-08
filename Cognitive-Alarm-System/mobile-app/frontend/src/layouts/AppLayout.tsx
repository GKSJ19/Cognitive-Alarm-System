import { ChartNoAxesCombined, LogOut, Loader2 } from "lucide-react";
import { NavLink, Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { NAV_ITEMS, APP_FULL_NAME } from "../constants";

export function AppLayout() {
  const { user, token, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm">Verifying session...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-card px-4 py-5 md:flex flex-col justify-between">
        <div>
          <div className="mb-8 text-lg font-semibold tracking-tighter px-3">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
              {APP_FULL_NAME.split(" ")[0]} {APP_FULL_NAME.split(" ")[1]}
            </span>
          </div>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              // We'll just map the icon manually for now
              const isDashboard = item.to === "/dashboard";
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                      isActive
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                    ].join(" ")
                  }
                >
                  {isDashboard && <ChartNoAxesCombined className="h-4 w-4" />}
                  {!isDashboard && <div className="h-4 w-4 rounded bg-white/10"></div>}
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-white/10 pt-4">
          <div className="px-3 mb-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
              {user.full_name ? user.full_name[0].toUpperCase() : user.email[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.full_name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="min-h-screen md:pl-64">
        <Outlet />
      </main>
    </div>
  );
}
