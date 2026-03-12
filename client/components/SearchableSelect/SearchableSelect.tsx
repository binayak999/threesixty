"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import type { SearchableSelectProps, SearchableSelectOption } from "./types";
import "./SearchableSelect.css";

const DEFAULT_EMPTY = "No options found.";

export default function SearchableSelect({
  options: optionsProp,
  value,
  onChange,
  multiple = false,
  placeholder = "Search…",
  loading = false,
  fetchOptions,
  label,
  id,
  disabled = false,
  emptyMessage = DEFAULT_EMPTY,
  icon,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<SearchableSelectOption[]>(optionsProp);
  const [fetching, setFetching] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const values = Array.isArray(value) ? value : value ? [value] : [];
  const singleValue = !multiple && typeof value === "string" ? value : "";

  useEffect(() => {
    setOptions(optionsProp);
  }, [optionsProp]);

  useEffect(() => {
    if (open && options.length === 0 && fetchOptions && !loading && !fetching) {
      setFetching(true);
      fetchOptions()
        .then((list) => {
          setOptions(list);
        })
        .catch(() => {})
        .finally(() => setFetching(false));
    }
  }, [open, options.length, fetchOptions, loading, fetching]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.subtitle ?? "").toLowerCase().includes(q)
    );
  }, [options, search]);

  useEffect(() => {
    setHighlightIndex(-1);
  }, [search, filtered.length]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const el = listRef.current.children[highlightIndex] as HTMLElement;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => (i < filtered.length - 1 ? i + 1 : i));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => (i > 0 ? i - 1 : -1));
      return;
    }
    if (e.key === "Enter" && highlightIndex >= 0 && filtered[highlightIndex]) {
      e.preventDefault();
      selectOption(filtered[highlightIndex]);
      return;
    }
  };

  const selectOption = (opt: SearchableSelectOption) => {
    if (multiple) {
      const set = new Set(values);
      if (set.has(opt.value)) set.delete(opt.value);
      else set.add(opt.value);
      onChange(Array.from(set));
    } else {
      onChange(opt.value);
      setOpen(false);
      setSearch("");
    }
  };

  const removeMulti = (val: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(values.filter((v) => v !== val));
  };

  const displayLabel = (opt: SearchableSelectOption) =>
    opt.subtitle ? `${opt.label} (${opt.subtitle})` : opt.label;

  const selectedOptions = options.filter((o) => values.includes(o.value));
  const isBusy = loading || fetching;

  return (
    <div
      ref={containerRef}
      className={`searchable-select ${open ? "searchable-select-open" : ""} ${disabled ? "searchable-select-disabled" : ""}`}
    >
      {label && (
        <label className="form-label fw-medium mb-2" htmlFor={id}>
          {label}
        </label>
      )}
      <div
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={id ? `${id}-listbox` : undefined}
        id={id}
        aria-disabled={disabled}
        className="searchable-select-trigger"
        onClick={() => !disabled && setOpen(!open)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
      >
        <div className="searchable-select-value">
          {multiple ? (
            values.length === 0 ? (
              <span className="searchable-select-placeholder">
                {icon && <i className={`fas ${icon} me-2 text-muted`} />}
                {placeholder}
              </span>
            ) : (
              <div className="d-flex flex-wrap gap-1 align-items-center">
                {selectedOptions.map((o) => (
                  <span key={o.value} className="searchable-select-tag">
                    {o.label}
                    <button
                      type="button"
                      className="searchable-select-tag-remove"
                      onClick={(e) => removeMulti(o.value, e)}
                      aria-label={`Remove ${o.label}`}
                    >
                      <i className="fas fa-times" />
                    </button>
                  </span>
                ))}
              </div>
            )
          ) : singleValue ? (
            (() => {
              const sel = options.find((o) => o.value === singleValue);
              return (
                <span>
                  {icon && <i className={`fas ${icon} me-2 text-primary`} />}
                  {sel ? displayLabel(sel) : singleValue}
                </span>
              );
            })()
          ) : (() => {
              const emptyOpt = options.find((o) => o.value === "");
              return emptyOpt ? (
                <span>
                  {icon && <i className={`fas ${icon} me-2 text-primary`} />}
                  {displayLabel(emptyOpt)}
                </span>
              ) : (
            <span className="searchable-select-placeholder">
                {icon && <i className={`fas ${icon} me-2 text-muted`} />}
                {placeholder}
              </span>
              );
            })()}
        </div>
        <span className="searchable-select-arrow">
          <i className={`fas fa-chevron-${open ? "up" : "down"}`} />
        </span>
      </div>

      {open && (
        <div className="searchable-select-dropdown">
          <div className="searchable-select-search">
            <i className="fas fa-search searchable-select-search-icon" />
            <input
              type="text"
              className="form-control"
              placeholder="Type to search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              aria-autocomplete="list"
              aria-controls={id ? `${id}-listbox` : undefined}
            />
          </div>
          <ul
            ref={listRef}
            id={id ? `${id}-listbox` : undefined}
            role="listbox"
            className="searchable-select-list"
            aria-multiselectable={multiple || undefined}
          >
            {isBusy ? (
              <li className="searchable-select-item searchable-select-item-loading">
                <div className="spinner-border spinner-border-sm text-primary me-2" />
                Loading…
              </li>
            ) : filtered.length === 0 ? (
              <li className="searchable-select-item searchable-select-item-empty">
                {emptyMessage}
              </li>
            ) : (
              filtered.map((opt, idx) => {
                const isSelected = values.includes(opt.value);
                const isHighlighted = idx === highlightIndex;
                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    className={`searchable-select-item ${isSelected ? "selected" : ""} ${isHighlighted ? "highlighted" : ""}`}
                    onClick={() => selectOption(opt)}
                    onMouseEnter={() => setHighlightIndex(idx)}
                  >
                    {multiple && (
                      <span className="searchable-select-item-check me-2">
                        {isSelected ? <i className="fas fa-check" /> : null}
                      </span>
                    )}
                    <span>{displayLabel(opt)}</span>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export type { SearchableSelectProps, SearchableSelectOption };
