import React from 'react';

interface SearchBarProps {
  search?: string;
  status?: string;
  onSearchChange?: (val: string) => void;
  onStatusChange?: (val: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  search = '',
  status = '',
  onSearchChange,
  onStatusChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <input
        type="text"
        placeholder="Search by reference number..."
        value={search}
        onChange={(e) => onSearchChange?.(e.target.value)}
        className="flex-1 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <select
        value={status}
        onChange={(e) => onStatusChange?.(e.target.value)}
        className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">All Statuses</option>
        <option value="BOOKED">Booked</option>
        <option value="IN_TRANSIT">In Transit</option>
        <option value="CUSTOMS_HOLD">Customs Hold</option>
        <option value="DELIVERED">Delivered</option>
      </select>
    </div>
  );
};

export default SearchBar;
