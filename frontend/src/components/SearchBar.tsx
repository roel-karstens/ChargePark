/**
 * SearchBar component - destination search with autocomplete.
 *
 * Features:
 * - Text input with autocomplete dropdown
 * - Debounced search
 * - Shows search results
 * - Click to select location
 * - Loading/error states
 * - Mobile-friendly (48px+ touch targets)
 */

import React, { useState, useEffect, useRef } from 'react';
import { useGeocoding } from '../hooks/useGeocoding';
import type { GeocodeResult } from '../types';

interface SearchBarProps {
  onSelect: (result: GeocodeResult) => void;
  disabled?: boolean;
}

export function SearchBar({ onSelect, disabled = false }: SearchBarProps): JSX.Element {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { results, isLoading, error, search, clearResults } = useGeocoding();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (input.trim().length < 2) {
      clearResults();
      setIsOpen(false);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      search(input);
      setIsOpen(true);
    }, 300); // 300ms debounce

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [input, search, clearResults]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: GeocodeResult) => {
    setInput(result.name);
    setIsOpen(false);
    onSelect(result);
  };

  return (
    <div className="relative w-full">
      {/* Search input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => input.trim().length >= 2 && setIsOpen(true)}
          disabled={disabled}
          placeholder="Enter destination (e.g., Rotterdam Centraal)"
          className={`w-full px-4 py-3 h-12 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
          }`}
          aria-label="Destination search"
          aria-autocomplete="list"
          aria-expanded={isOpen}
        />

        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute right-4 top-3.5">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        )}

        {/* Error icon */}
        {error && !isLoading && (
          <div className="absolute right-4 top-3.5">
            <span className="text-red-500 text-xl">⚠️</span>
          </div>
        )}

        {/* Clear button */}
        {input && !isLoading && (
          <button
            onClick={() => setInput('')}
            className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {isOpen && input.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
          {isLoading && (
            <div className="p-4 text-center text-gray-500">
              Searching...
            </div>
          )}

          {error && (
            <div className="p-4 text-center text-red-500 text-sm">
              {error}
            </div>
          )}

          {!isLoading && !error && results.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No results found
            </div>
          )}

          {results.map((result) => (
            <button
              key={result.address}
              onClick={() => handleSelect(result)}
              className="w-full text-left px-4 py-3 h-14 hover:bg-blue-50 transition border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-blue-50"
              type="button"
            >
              <div className="font-medium text-sm text-gray-900">
                {result.name}
              </div>
              <div className="text-xs text-gray-500">
                {result.address}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Error message */}
      {error && !isOpen && (
        <div className="mt-1 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
