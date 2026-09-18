import React from "react";

interface SearchBarProps {
  search?: string;
  status?: string;
  onSearchChange?: (value: string) => void;
  onStatusChange?: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  search = "",
  status = "",
  onSearchChange,
  onStatusChange,
}) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <label className="min-w-0 flex-1">
        <span className="sr-only">Search by reference number</span>
        <input
          type="search"
          placeholder="Search by reference number..."
          value={search}
          onChange={(event) => onSearchChange?.(event.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </label>
      <label className="sm:w-52">
        <span className="sr-only">Filter by status</span>
        <select
          value={status}
          onChange={(event) => onStatusChange?.(event.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">All statuses</option>
          <option value="BOOKED">Booked</option>
          <option value="IN_TRANSIT">In Transit</option>
          <option value="CUSTOMS_HOLD">Customs Hold</option>
          <option value="DELIVERED">Delivered</option>
        </select>
      </label>
    </div>
  );
};

export default SearchBar;
