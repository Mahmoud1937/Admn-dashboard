import SidebarHeader from "./SidebarHeader";
import SidebarItem from "./SidebarItem";
import { navigation } from "./navigation";

export default function Sidebar({ collapsed, setCollapsed }) {
  return (
    <aside
      className={`flex h-screen min-w-0 flex-col border-r border-slate-200 bg-white transition-all duration-300 ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      <SidebarHeader collapsed={collapsed} setCollapsed={setCollapsed} />

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navigation.map((item) => (
          <SidebarItem key={item.path} {...item} collapsed={collapsed} />
        ))}
      </nav>
    </aside>
  );
}