"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { X, ChevronRight, Plus, Search, Loader2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────

interface OptionItem {
  id: string;
  name: string;
  keywords?: string[];
  group?: string;
  metadata?: Record<string, unknown>;
}

interface InterestCategory {
  id: string;
  name: string;
  icon?: string;
  subcategories: {
    id: string;
    name: string;
    interests: { id: string; name: string; keywords: string[] }[];
  }[];
}

interface SmartTagPickerProps {
  values: string[];
  onChange: (values: string[]) => void;
  enumType?: string;
  allInterests?: boolean;
  interestCategoryId?: string;
  staticOptions?: { id: string; name: string }[];
  allowCustom?: boolean;
  maxSelections?: number;
  singleSelect?: boolean;
  label?: string;
  placeholder?: string;
  color?: string;
  className?: string;
}

// ─── Fuzzy matching ──────────────────────────────────────────────────

function fuzzyMatch(query: string, target: string): number {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (t === q) return 1;
  if (t.startsWith(q)) return 0.9;
  if (t.includes(q)) return 0.7;
  return 0;
}

function matchOption(query: string, option: OptionItem): number {
  const nameScore = fuzzyMatch(query, option.name);
  if (nameScore > 0) return nameScore;

  if (option.keywords) {
    for (const kw of option.keywords) {
      const kwScore = fuzzyMatch(query, kw);
      if (kwScore > 0) return kwScore * 0.8;
    }
  }
  return 0;
}

// ─── Tag Pill ─────────────────────────────────────────────────────────

function TagPill({
  label,
  onRemove,
  color = "purple",
}: {
  label: string;
  onRemove: () => void;
  color?: string;
}) {
  const colorMap: Record<string, string> = {
    purple: "bg-purple-100 text-purple-800 border-purple-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    green: "bg-green-100 text-green-800 border-green-200",
    pink: "bg-pink-100 text-pink-800 border-pink-200",
    amber: "bg-amber-100 text-amber-800 border-amber-200",
    teal: "bg-teal-100 text-teal-800 border-teal-200",
    rose: "bg-rose-100 text-rose-800 border-rose-200",
    indigo: "bg-indigo-100 text-indigo-800 border-indigo-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${colorMap[color] || colorMap.purple}`}
    >
      {label}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="hover:opacity-70 transition-opacity"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

// ─── SmartTagPicker ──────────────────────────────────────────────────

export function SmartTagPicker({
  values,
  onChange,
  enumType,
  allInterests,
  interestCategoryId,
  staticOptions,
  allowCustom = true,
  maxSelections,
  singleSelect,
  label,
  placeholder = "Search or type...",
  color = "purple",
  className = "",
}: SmartTagPickerProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<OptionItem[]>([]);
  const [interestTaxonomy, setInterestTaxonomy] = useState<InterestCategory[]>(
    []
  );
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedSubcategory, setExpandedSubcategory] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isInterestMode = allInterests || !!interestCategoryId;

  // Load options from API
  useEffect(() => {
    async function loadOptions() {
      if (staticOptions) {
        setOptions(staticOptions.map((o) => ({ ...o })));
        return;
      }

      setLoading(true);
      try {
        if (isInterestMode) {
          const res = await fetch("/api/reference-data?type=interests");
          const data: InterestCategory[] = await res.json();
          if (interestCategoryId) {
            setInterestTaxonomy(
              data.filter((c) => c.id === interestCategoryId)
            );
          } else {
            setInterestTaxonomy(data);
          }
          // Flatten for search
          const flat: OptionItem[] = [];
          data.forEach((cat) =>
            cat.subcategories.forEach((sub) =>
              sub.interests.forEach((int) =>
                flat.push({
                  id: int.id,
                  name: int.name,
                  keywords: int.keywords,
                  group: `${cat.name} > ${sub.name}`,
                })
              )
            )
          );
          setOptions(flat);
        } else if (enumType) {
          const res = await fetch(
            `/api/reference-data?type=enum&enum_type=${enumType}`
          );
          const data = await res.json();
          setOptions(
            data.map(
              (d: {
                id: string;
                name: string;
                metadata?: Record<string, unknown>;
              }) => ({
                id: d.id,
                name: d.name,
                group: (d.metadata as { group?: string })?.group,
                metadata: d.metadata,
              })
            )
          );
        }
      } catch (err) {
        console.error("Failed to load reference data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadOptions();
  }, [enumType, allInterests, interestCategoryId, staticOptions, isInterestMode]);

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    return options
      .map((opt) => ({ opt, score: matchOption(search, opt) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ opt }) => opt);
  }, [search, options]);

  // Group filtered options for display
  const groupedOptions = useMemo(() => {
    if (isInterestMode && !search.trim()) return null; // Use taxonomy drill-down
    const groups = new Map<string, OptionItem[]>();
    filteredOptions.forEach((opt) => {
      const group = opt.group || "Options";
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group)!.push(opt);
    });
    return groups;
  }, [filteredOptions, isInterestMode, search]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const addValue = useCallback(
    (name: string) => {
      if (singleSelect) {
        onChange([name]);
        setIsOpen(false);
        setSearch("");
        return;
      }
      if (values.includes(name)) return;
      if (maxSelections && values.length >= maxSelections) return;
      onChange([...values, name]);
      setSearch("");
    },
    [values, onChange, singleSelect, maxSelections]
  );

  const removeValue = useCallback(
    (name: string) => {
      onChange(values.filter((v) => v !== name));
    },
    [values, onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && search.trim()) {
      e.preventDefault();
      // If there's a matching option, select it
      if (filteredOptions.length > 0) {
        addValue(filteredOptions[0].name);
      } else if (allowCustom) {
        addValue(search.trim());
      }
    }
    if (e.key === "Backspace" && !search && values.length > 0) {
      removeValue(values[values.length - 1]);
    }
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const atLimit = maxSelections ? values.length >= maxSelections : false;
  const showCustom =
    allowCustom &&
    search.trim() &&
    !filteredOptions.some(
      (o) => o.name.toLowerCase() === search.trim().toLowerCase()
    ) &&
    !values.includes(search.trim());

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      {/* Selected tags + input */}
      <div
        className="min-h-[38px] flex flex-wrap gap-1.5 items-center px-2 py-1.5 border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500 cursor-text"
        onClick={() => {
          inputRef.current?.focus();
          if (!isOpen) setIsOpen(true);
        }}
      >
        {values.map((val) => (
          <TagPill
            key={val}
            label={val}
            color={color}
            onRemove={() => removeValue(val)}
          />
        ))}
        {!atLimit && (
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={values.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[80px] outline-none text-sm bg-transparent"
          />
        )}
        {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
      </div>

      {/* Dropdown */}
      {isOpen && !atLimit && (
        <div className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
          {/* Interest taxonomy drill-down (no search active) */}
          {isInterestMode && !search.trim() ? (
            <div>
              {interestTaxonomy.map((cat) => (
                <div key={cat.id}>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 flex items-center justify-between"
                    onClick={() =>
                      setExpandedCategory(
                        expandedCategory === cat.id ? null : cat.id
                      )
                    }
                  >
                    <span>{cat.name}</span>
                    <ChevronRight
                      className={`w-4 h-4 text-gray-400 transition-transform ${expandedCategory === cat.id ? "rotate-90" : ""}`}
                    />
                  </button>
                  {expandedCategory === cat.id && (
                    <div className="pl-3">
                      {cat.subcategories.map((sub) => (
                        <div key={sub.id}>
                          <button
                            type="button"
                            className="w-full text-left px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-between"
                            onClick={() =>
                              setExpandedSubcategory(
                                expandedSubcategory === sub.id ? null : sub.id
                              )
                            }
                          >
                            <span>{sub.name}</span>
                            <ChevronRight
                              className={`w-3 h-3 text-gray-400 transition-transform ${expandedSubcategory === sub.id ? "rotate-90" : ""}`}
                            />
                          </button>
                          {expandedSubcategory === sub.id && (
                            <div className="pl-4">
                              {sub.interests.map((int) => {
                                const selected = values.includes(int.name);
                                return (
                                  <button
                                    type="button"
                                    key={int.id}
                                    className={`w-full text-left px-3 py-1 text-sm hover:bg-purple-50 ${selected ? "text-purple-600 font-medium" : "text-gray-700"}`}
                                    onClick={() =>
                                      selected
                                        ? removeValue(int.name)
                                        : addValue(int.name)
                                    }
                                  >
                                    {selected && "✓ "}
                                    {int.name}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Flat/grouped list (search active or enum mode) */}
              {groupedOptions && groupedOptions.size > 0 ? (
                Array.from(groupedOptions.entries()).map(
                  ([group, items]) => (
                    <div key={group}>
                      {groupedOptions.size > 1 && (
                        <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                          {group}
                        </div>
                      )}
                      {items.map((opt) => {
                        const selected = values.includes(opt.name);
                        return (
                          <button
                            type="button"
                            key={opt.id}
                            className={`w-full text-left px-3 py-1.5 text-sm hover:bg-purple-50 ${selected ? "text-purple-600 font-medium" : "text-gray-700"}`}
                            onClick={() =>
                              selected
                                ? removeValue(opt.name)
                                : addValue(opt.name)
                            }
                          >
                            {selected && "✓ "}
                            {opt.name}
                            {opt.metadata &&
                              "range" in opt.metadata && (
                                <span className="text-xs text-gray-400 ml-1">
                                  ({String(opt.metadata.range)})
                                </span>
                              )}
                            {opt.metadata &&
                              "hex" in opt.metadata && (
                                <span
                                  className="inline-block w-3 h-3 rounded-full ml-1 align-middle border border-gray-200"
                                  style={{
                                    backgroundColor: String(opt.metadata.hex),
                                  }}
                                />
                              )}
                          </button>
                        );
                      })}
                    </div>
                  )
                )
              ) : !showCustom ? (
                <div className="px-3 py-2 text-sm text-gray-400">
                  No matches found
                </div>
              ) : null}

              {/* Custom value escape hatch */}
              {showCustom && (
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 flex items-center gap-1 border-t border-gray-100"
                  onClick={() => addValue(search.trim())}
                >
                  <Plus className="w-3 h-3" />
                  Add &quot;{search.trim()}&quot;
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
