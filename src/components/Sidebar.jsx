import { NavLink } from 'react-router-dom';
import { HiHome, HiUsers, HiTag, HiShoppingBag, HiClipboardList, HiPhotograph, HiStar, HiColorSwatch, HiCollection, HiX } from 'react-icons/hi';

const navItems = [
  { to: '/', icon: HiHome, label: 'Dashboard', end: true },
  { to: '/users', icon: HiUsers, label: 'Users' },
  { to: '/categories', icon: HiCollection, label: 'Categories' },
  { to: '/brands', icon: HiTag, label: 'Brands' },
  { to: '/products', icon: HiShoppingBag, label: 'Products' },
  { to: '/attributes', icon: HiColorSwatch, label: 'Attributes' },
  { to: '/orders', icon: HiClipboardList, label: 'Orders' },
  { to: '/banners', icon: HiPhotograph, label: 'Banners' },
  { to: '/featured-sections', icon: HiStar, label: 'Featured Sections' },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Overlay on mobile */}
      {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />}

      <aside className={`fixed top-0 left-0 z-40 h-screen w-64 bg-gray-900 text-white transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
          <h1 className="text-xl font-bold tracking-tight">Admin Panel</h1>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
            <HiX className="w-6 h-6" />
          </button>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
