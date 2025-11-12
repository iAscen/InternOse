export default function Footer() {
  return (
    <footer className="relative z-30 flex grow-0 items-center border-t border-slate-200 bg-slate-100">
      <div className="flex w-full items-center justify-between py-10 pl-8 pr-4 sm:pr-8">
        <div className="inline-flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-900">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
            <svg
              className="bi bi-window-sidebar inline-block size-6 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M2.5 4a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm2-.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm1 .5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
              <path d="M2 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H2zm12 1a1 1 0 0 1 1 1v2H1V3a1 1 0 0 1 1-1h12zM1 13V6h4v8H2a1 1 0 0 1-1-1zm5 1V6h9v7a1 1 0 0 1-1 1H6z" />
            </svg>
          </div>
          <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Intern<span className="text-indigo-600">OSE</span>
          </span>
        </div>
        <div className="text-sm font-medium text-slate-600">
          Made by Walid, David, Kervin, Amine et Artyom
        </div>
      </div>
    </footer>
  );
}
