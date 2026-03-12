export interface SearchableSelectOption {
  value: string;
  label: string;
  /** Optional subtitle or extra text (e.g. city for locations) */
  subtitle?: string;
}

export interface SearchableSelectProps {
  /** Options to show. If not provided, use fetchOptions to load. */
  options: SearchableSelectOption[];
  /** Current value (single mode) or values (multi mode) */
  value: string | string[];
  onChange: (value: string | string[]) => void;
  /** Allow multiple selection */
  multiple?: boolean;
  placeholder?: string;
  /** When true, show loading spinner instead of options */
  loading?: boolean;
  /** Fetch options (e.g. from API). Used when options are empty on mount. */
  fetchOptions?: () => Promise<SearchableSelectOption[]>;
  /** Optional label above the control */
  label?: string;
  /** Optional id for the trigger (accessibility) */
  id?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Empty message when no options match search */
  emptyMessage?: string;
  /** Optional icon class (e.g. fa-layer-group) shown in trigger when no value */
  icon?: string;
}
