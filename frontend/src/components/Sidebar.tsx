import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊', end: true },
  { to: '/resources', label: 'Resources', icon: '🏢', end: false },
  { to: '/bookings', label: 'Bookings', icon: '📅', end: false },
  { to: '/users', label: 'Users', icon: '👥', end: false },
];

const Sidebar = () => (
  <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
    <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 font-bold text-white">
        R
      </span>
      <span className="font-semibold text-slate-800">Resource Booking</span>
    </div>
    <nav className="flex-1 space-y-1 p-3">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
              isActive
                ? 'bg-brand-50 text-brand-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`
          }
        >
          <span aria-hidden>{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default Sidebar;
