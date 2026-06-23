import { NavLink } from 'react-router-dom';
import UserSwitcher from './UserSwitcher';

const mobileNav = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/resources', label: 'Resources', end: false },
  { to: '/bookings', label: 'Bookings', end: false },
  { to: '/users', label: 'Users', end: false },
];

const Topbar = () => (
  <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
    <div className="flex h-16 items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 font-bold text-white">
          R
        </span>
        <span className="font-semibold text-slate-800">Resource Booking</span>
      </div>
      <div className="hidden md:block" />
      <UserSwitcher />
    </div>
    <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-2 py-2 md:hidden">
      {mobileNav.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ${
              isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  </header>
);

export default Topbar;
