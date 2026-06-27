import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();

  const isNavActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="text-on-surface bg-background antialiased flex h-screen overflow-hidden">
      {/* SideNavBar */}
      <aside className="w-[240px] h-screen sticky left-0 top-0 bg-surface border-r border-outline-variant flex-col p-md hidden md:flex shrink-0">
        {/* Header */}
        <div className="flex items-center gap-sm mb-lg">
          <img
            className="w-8 h-8 rounded-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5iSigBAEepc5JiHoJQCZOA3htZTNe5FDVS3GJNVZFsCCipbYWg3tj71c5eD18HuAzIfhE3B6jGtbl8kwWqzHVMRwpaXAY1MkC2HJQRo_8S6FrFGdb6vKepgR4FqzLr04SzQgN8VLK9WnRBxKCb719CWXmTcwBxWscAKelB0nJZZQdEXwGsV0lmmu4xxN4v1mzC05Orje1H0UQIBxZ3BBXjvu7-rrEAIsWCyVvLDkn9dDY5G5-wsbuKcSy3ptGWQj3-Mo8Fj5NikQ"
            alt="AIWX Avatar"
          />
          <div>
            <h1 className="font-display-lg text-headline-lg font-bold text-primary">AIWX</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">v1.0.4-stable</p>
          </div>
        </div>

        {/* CTA */}
        <button
          className="w-full bg-primary-container text-white hover:bg-primary transition-colors duration-200 rounded-lg py-sm px-md mb-md font-body-md text-body-md font-medium flex justify-center items-center gap-xs"
          onClick={() => {
            /* Handled globally or contextually later */
          }}
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Task
        </button>

        {/* Navigation Tabs */}
        <nav className="flex-1 flex flex-col gap-xs font-body-md text-body-md">
          <Link
            to="/"
            className={`${
              isNavActive('/')
                ? 'bg-secondary-container text-on-secondary-container'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            } rounded-xl flex items-center gap-sm py-sm px-md active:scale-[0.98] transition-transform`}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: isNavActive('/') ? "'FILL' 1" : "'FILL' 0" }}
            >
              assignment_turned_in
            </span>
            Tasks
          </Link>
          <a
            href="#"
            className="text-on-surface-variant hover:bg-surface-container-high rounded-xl flex items-center gap-sm py-sm px-md active:scale-[0.98] transition-transform"
          >
            <span className="material-symbols-outlined">apps</span>
            Applications
          </a>
          <a
            href="#"
            className="text-on-surface-variant hover:bg-surface-container-high rounded-xl flex items-center gap-sm py-sm px-md active:scale-[0.98] transition-transform"
          >
            <span className="material-symbols-outlined">dns</span>
            Environments
          </a>
          <a
            href="#"
            className="text-on-surface-variant hover:bg-surface-container-high rounded-xl flex items-center gap-sm py-sm px-md active:scale-[0.98] transition-transform"
          >
            <span className="material-symbols-outlined">terminal</span>
            Logs
          </a>
        </nav>

        {/* Footer Tabs */}
        <div className="mt-auto flex flex-col gap-xs font-body-md text-body-md border-t border-outline-variant pt-sm">
          <a
            href="#"
            className="text-on-surface-variant hover:bg-surface-container-high rounded-xl flex items-center gap-sm py-sm px-md active:scale-[0.98] transition-transform"
          >
            <span className="material-symbols-outlined">settings</span>
            Settings
          </a>
          <a
            href="#"
            className="text-on-surface-variant hover:bg-surface-container-high rounded-xl flex items-center gap-sm py-sm px-md active:scale-[0.98] transition-transform"
          >
            <span className="material-symbols-outlined">help_outline</span>
            Support
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        {/* TopNavBar */}
        <header className="bg-surface border-b border-outline-variant h-16 px-lg w-full flex justify-between items-center sticky top-0 z-50 shrink-0">
          {/* Mobile Brand (Hidden on Desktop) */}
          <div className="md:hidden flex items-center gap-sm">
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary">
              AIWX
            </h1>
          </div>
          {/* Search Bar on Left */}
          <div className="hidden md:flex items-center w-64 relative">
            <span className="material-symbols-outlined absolute left-sm text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              className="input-light w-full pl-8 pr-sm py-[6px] rounded border font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-0 placeholder-on-surface-variant"
              placeholder="Search tasks, IDs..."
              type="text"
            />
          </div>
          <div className="flex items-center gap-md">
            {/* Navigation Links */}
            <span className="font-label-md text-label-md uppercase text-on-surface-variant hidden md:inline-block">
              Status: 8/12 Envs Active
            </span>
            {/* Trailing Icon Actions */}
            <div className="flex items-center gap-sm">
              <button
                className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer active:opacity-80 p-xs rounded-full hover:bg-surface-variant"
                onClick={() => document.documentElement.classList.toggle('dark')}
                title="Toggle Theme"
              >
                <span className="material-symbols-outlined">dark_mode</span>
              </button>
              <button className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer active:opacity-80 p-xs rounded-full hover:bg-surface-variant">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer active:opacity-80 p-xs rounded-full hover:bg-surface-variant">
                <span className="material-symbols-outlined">account_circle</span>
              </button>
            </div>
            {/* Trailing Primary Action */}
            <button className="bg-primary-container text-white font-label-md text-label-md uppercase px-md py-sm rounded hidden sm:block hover:bg-primary transition-colors">
              Deploy All
            </button>
          </div>
        </header>

        {/* Page Canvas */}
        <div className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop bg-background">
          <div className="max-w-[1400px] mx-auto space-y-lg">{children}</div>
        </div>
      </main>
    </div>
  );
}
