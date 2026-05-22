import { type RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { type DialPlan, type PhoneMaskCandidate } from '../utils/dialPlans';

export type UseCountrySelectOptions = {
  /** Full list of dial plans to display. Typically `allPlans` from `usePhoneMask`. */
  allPlans: DialPlan[];
  /** Called when the user picks a country. Wire to `selectPlan` from `usePhoneMask`. */
  onSelect: (plan: DialPlan) => void;
  /** ISO id of the currently active plan (e.g. `"RU"`). Pass `id` from `usePhoneMask`. */
  currentId?: string | null;
  /**
   * Live candidates from `usePhoneMask` — prefix-matched plans that are surfaced
   * when the user types a phone number.
   */
  candidates?: PhoneMaskCandidate[];
  /**
   * ISO ids to pin at the top of the list.
   * Example: `['US', 'GB', 'RU']`
   */
  priorityIds?: string[];
  /**
   * Controls whether `priorityIds` are always visible at the top of the list.
   *
   * - `false` (default) — **dynamic mode**: when the phone input is empty, `priorityIds`
   *   float to the top. As soon as the user starts typing, candidates take over and
   *   `priorityIds` step aside — the list reflects only the current prefix match.
   *
   * - `true` — **sticky mode**: `priorityIds` are always pinned at the top regardless
   *   of what is typed. Candidates that are not already pinned bubble to the top of
   *   the section *below* the pinned group (just after the divider).
   *
   * @default false
   */
  stickyPins?: boolean;
  /**
   * Ref to the phone input element. When provided, focus is automatically
   * returned to the input after the user selects a country from the dropdown.
   */
  inputRef?: RefObject<HTMLInputElement | null>;
  /**
   * When `true`, candidate-based floating is disabled — plans no longer bubble to the
   * top based on the typed prefix. `priorityIds` / `stickyPins` still apply.
   * Search-based filtering still applies.
   *
   * Useful when you manage candidate ordering externally (server-side sort, custom comparator, etc.).
   *
   * @default false
   */
  disableSort?: boolean;
  /**
   * When `true`, the hook skips its built-in outside-click and Escape-key listeners
   * as well as the auto-focus of `searchRef`.
   * Use this when integrating with a component library (e.g. Radix UI) that manages
   * those interactions on its own.
   *
   * @default false
   */
  noInternalListeners?: boolean;
};

export type UseCountrySelectResult = {
  /** Whether the dropdown is currently open. */
  isOpen: boolean;
  /** Toggle the dropdown open/closed. Attach to the trigger button's `onClick`. */
  toggle: () => void;
  /** Close the dropdown and clear the search query. */
  close: () => void;
  /** Current search query string. */
  query: string;
  /** Update the search query. Attach to the search input's `onChange`. */
  setQuery: (query: string) => void;
  /** The currently selected `DialPlan`, or `undefined` if nothing is selected yet. */
  currentPlan: DialPlan | undefined;
  /**
   * Sorted + filtered list of plans to render.
   * When searching: filtered by label / dial code, no reordering.
   * When idle: ordered according to `stickyPins` + `candidates` + `priorityIds` rules.
   */
  items: DialPlan[];
  /**
   * Index at which to insert a visual divider *before* `items[dividerAfter]`.
   * `-1` means no divider is needed.
   */
  dividerAfter: number;
  /** Attach to the root container element to enable close-on-outside-click. */
  containerRef: RefObject<HTMLDivElement | null>;
  /** Attach to the search `<input>` — auto-focused when the dropdown opens. */
  searchRef: RefObject<HTMLInputElement | null>;
  /** Select a plan: calls `onSelect` and closes the dropdown. */
  select: (plan: DialPlan) => void;
};

function buildPlansMap(plans: DialPlan[]): Map<string, DialPlan> {
  return new Map(plans.map((p) => [p.id ?? p.cc, p]));
}

/** Return true if `plan` matches a lowercased search query. */
function matchesQuery(plan: DialPlan, q: string): boolean {
  return (plan.label?.toLowerCase().includes(q) ?? false) || `+${plan.cc}`.includes(q);
}

/**
 * Build the sorted item list and divider position for idle mode (no search query).
 *
 * `currentId` distinguishes "input is empty" (`null`) from "single plan resolved,
 * no ambiguous candidates" (non-null). `selectPhoneMask` returns `candidates: []`
 * in both cases, so `currentId` is the only reliable signal.
 *
 * Floating only happens when there are **multiple** candidates (genuine ambiguity,
 * e.g. `+7` → RU / KZ). A single resolved plan needs no special treatment.
 *
 * **Dynamic mode** (`stickyPins = false`, default):
 *   - `currentId === null` (empty input) → `priorityIds` float to the top.
 *   - Multiple candidates → candidates float to the top; `priorityIds` are ignored.
 *   - Single resolved plan, or no match → natural order, no grouping.
 *
 * **Sticky mode** (`stickyPins = true`):
 *   - `priorityIds` are always pinned first; divider placed after them.
 *   - Multiple candidates not already pinned bubble just below the divider.
 *   - If there are no `priorityIds`, behaves like dynamic mode.
 */
function buildIdleItems(
  allPlans: DialPlan[],
  candidates: PhoneMaskCandidate[] | undefined,
  currentId: string | null | undefined,
  priorityIds: string[] | undefined,
  plansById: Map<string, DialPlan>,
  stickyPins: boolean,
): { items: DialPlan[]; dividerAfter: number } {
  const activeIds = candidates?.filter((c) => plansById.has(c.id)).map((c) => c.id) ?? [];
  const hasActive = activeIds.length > 1;

  let topIds: string[];
  let divider = -1;

  if (stickyPins) {
    const pinned = (priorityIds ?? []).filter((id) => plansById.has(id));
    if (pinned.length) {
      const pinnedSet = new Set(pinned);
      const floating = hasActive ? activeIds.filter((id) => !pinnedSet.has(id)) : [];
      topIds = floating.length ? [...pinned, ...floating] : pinned;
      divider = pinned.length;
    } else {
      // No priorityIds to pin — fall back to dynamic-mode behaviour.
      topIds = currentId != null && hasActive ? activeIds : [];
    }
  } else if (currentId == null) {
    // Empty input: float priorityIds.
    topIds = (priorityIds ?? []).filter((id) => plansById.has(id));
  } else {
    // Input present: float ambiguous candidates.
    topIds = hasActive ? activeIds : [];
  }

  if (!topIds.length) return { items: allPlans, dividerAfter: -1 };

  const excludedSet = new Set(topIds);
  const top = topIds.map((id) => plansById.get(id)!);
  const rest = allPlans.filter((p) => !excludedSet.has(p.id ?? p.cc));

  return { items: [...top, ...rest], dividerAfter: divider === -1 ? top.length : divider };
}

/**
 * Headless hook for building a country-selector dropdown that pairs with `usePhoneMask`.
 *
 * Handles: sorting by candidates / pinned ids, search filtering, open state,
 * outside-click to close, Escape to close, and auto-focusing the search input.
 *
 * The hook returns pure data + refs — rendering is entirely up to the consumer.
 *
 * @example
 * ```tsx
 * const { isOpen, toggle, query, setQuery, items, dividerAfter,
 *         containerRef, searchRef, select, currentPlan } = useCountrySelect({
 *   allPlans, currentId: id, onSelect: selectPlan,
 *   candidates, priorityIds: ['US', 'GB'], stickyPins: true,
 * });
 * ```
 */
export function useCountrySelect({
  allPlans,
  currentId,
  onSelect,
  candidates,
  priorityIds,
  stickyPins = false,
  inputRef,
  disableSort = false,
  noInternalListeners = false,
}: UseCountrySelectOptions): UseCountrySelectResult {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const plansById = useMemo(() => buildPlansMap(allPlans), [allPlans]);

  const currentPlan = useMemo(() => (currentId != null ? plansById.get(currentId) : undefined), [currentId, plansById]);

  const { items, dividerAfter } = useMemo(() => {
    const q = query.trim().toLowerCase();

    // Search mode: filter in natural order, no reordering.
    if (q) {
      return { items: allPlans.filter((p) => matchesQuery(p, q)), dividerAfter: -1 };
    }

    // disableSort disables candidate-based floating only; stickyPins / priorityIds still apply.
    return buildIdleItems(
      allPlans,
      disableSort ? undefined : candidates,
      currentId,
      priorityIds,
      plansById,
      stickyPins,
    );
  }, [allPlans, candidates, currentId, disableSort, plansById, priorityIds, query, stickyPins]);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
  }, []);

  useEffect(() => {
    if (!isOpen || noInternalListeners) return undefined;

    searchRef.current?.focus();

    const onMouseDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [close, isOpen, noInternalListeners]);

  const toggle = useCallback(() => {
    setIsOpen((v) => !v);
  }, []);

  const select = useCallback(
    (plan: DialPlan) => {
      onSelectRef.current(plan);

      // flushSync forces React to flush the setState from close() synchronously
      // so the dropdown is removed from the DOM before focus() is called —
      // otherwise the browser moves focus to body and the input never receives it.
      flushSync(() => {
        close();
      });

      inputRef?.current?.focus();
    },
    [close, inputRef],
  );

  return {
    isOpen,
    toggle,
    close,
    query,
    setQuery,
    currentPlan,
    items,
    dividerAfter,
    containerRef,
    searchRef,
    select,
  };
}
