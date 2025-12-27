import React from 'react';

interface FilterOption {
  id: string;
  label: string;
}

interface FilterSidebarProps {
  filters: FilterOption[];
  activeFilter: string;
  onSelect: (id: string) => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, activeFilter, onSelect }) => {
  return (
    <aside className="lg:sticky lg:top-28 h-fit">
      <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent"></div>
        <p className="relative text-xs text-gray-300 uppercase tracking-[0.4em] mb-5">Filter the vibe</p>
        <div className="relative flex flex-col gap-2">
          {filters.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => onSelect(filter.id)}
                aria-pressed={isActive}
                className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all duration-300 ${
                  isActive
                    ? 'bg-cyan-500/80 text-white shadow-[0_0_18px_rgba(6,182,212,0.6)] font-bold ring-1 ring-cyan-300/80'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className={`h-2.5 w-2.5 rounded-full border ${
                  isActive ? 'bg-cyan-200 border-cyan-100 shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'border-white/30 group-hover:border-cyan-200'
                }`}></span>
                <span className="text-sm tracking-wide">{filter.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
