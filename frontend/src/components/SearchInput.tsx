interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchInput = ({ value, onChange, placeholder = 'Search…' }: SearchInputProps) => (
  <div className="relative w-full sm:w-72">
    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
      🔍
    </span>
    <input
      type="search"
      className="input pl-9"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default SearchInput;
