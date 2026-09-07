import SidebarHeader from "./SidebarHeader";
import SidebarItem from "./SidebarItem";
import SidebarGroup from "./SidebarGroup";
import { navigation } from "./navigation";

export default function Sidebar({ collapsed, setCollapsed }) {
  return (
    <aside
      className={`relative z-40 flex h-screen min-w-0 shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-300 ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      <SidebarHeader collapsed={collapsed} setCollapsed={setCollapsed} />

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navigation.map((item) =>
          item.children ? (
            <SidebarGroup
              key={item.path}
              {...item}
              collapsed={collapsed}
              setCollapsed={setCollapsed}
            />
          ) : (
            <SidebarItem key={item.path} {...item} collapsed={collapsed} />
          )
        )}
      </nav>
    </aside>
  );
}
