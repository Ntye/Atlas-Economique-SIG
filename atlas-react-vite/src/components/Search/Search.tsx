import { type FC, useState, useCallback, useRef, useEffect } from 'react';
import { api } from '../../services/api';
import { highlightMatch } from '../../utils/helpers';
import type { SearchResult } from '../../interfaces';

interface SearchProps {
  onSelect: (result: SearchResult) => void;
}

const Search: FC<SearchProps> = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  const performSearch = useCallback(async (q: string) => {
    if (!q || q.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    try {
      const data = await api.search(q);
      setResults(data.results || []);
      setIsOpen(true);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => performSearch(value), 300);
  };

  const handleSelect = (result: SearchResult) => {
    setQuery(result.nom);
    setIsOpen(false);
    onSelect(result);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="search" ref={containerRef}>
      <input
        type="text"
        id="search-input"
        className="search__input"
        placeholder="Rechercher une region ou departement"
        autoComplete="off"
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => results.length > 0 && setIsOpen(true)}
        onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
      />
      <div className={`search__results ${isOpen ? 'search__results--active' : ''}`}>
        {results.length === 0 && query.length >= 2 ? (
          <div className="search__no-results">Aucun resultat trouve pour "{query}"</div>
        ) : (
          results.map((result, index) => (
            <div
              key={`${result.type}-${result.nom}-${index}`}
              className="search__result-item"
              onClick={() => handleSelect(result)}
            >
              <span className="search__result-badge">
                {result.type === 'region' ? 'Region' : 'Dept'}
              </span>
              <span
                className="search__result-name"
                dangerouslySetInnerHTML={{ __html: highlightMatch(result.nom, query) }}
              />
              {result.region_parente && (
                <small className="search__result-parent">({result.region_parente})</small>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Search;
