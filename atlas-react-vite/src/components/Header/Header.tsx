import { type FC, useEffect, useState } from 'react';
import { api } from '../../services/api';
import Search from '../Search';
import type { HeaderData, SearchResult, Theme } from '../../interfaces';

interface HeaderProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  onMenuToggle: () => void;
  onSearchSelect: (result: SearchResult) => void;
}

const Header: FC<HeaderProps> = ({ currentTheme, onThemeChange, onMenuToggle, onSearchSelect }) => {
  const [data, setData] = useState<HeaderData | null>(null);

  useEffect(() => {
    api
      .getHeader()
      .then(setData)
      .catch(() => {
        setData({
          titre: 'Atlas Economique du Cameroun',
          sousTitre: 'Visualisation des productions',
          version: '1.0.0',
          themes: [
            { id: 'tous', label: 'Vue Administrative' },
            { id: 'cacao', label: 'Cacao' },
            { id: 'bovins', label: 'Bovins' },
          ],
          langues: [],
        });
      });
  }, []);

  const themes: Theme[] = data?.themes || [
    { id: 'tous', label: 'Vue Administrative' },
  ];

  const showHelp = () => {
    alert(
      `${data?.titre || 'Atlas Economique du Cameroun'}\n\n` +
        'Utilisez les filtres pour explorer les donnees\n' +
        'Cliquez sur une region/departement pour voir les details\n' +
        'Changez de theme pour visualiser differentes productions\n' +
        'Utilisez la recherche pour trouver rapidement un lieu'
    );
  };

  return (
    <header className="header">
      <div className="header__logo">
        <button className="header__menu-btn" onClick={onMenuToggle}>
          &#9776;
        </button>
        <div>
          <h1 className="header__title">{data?.titre || 'Atlas Economique du Cameroun'}</h1>
          <div className="header__tagline">{data?.sousTitre || 'Visualisation des productions'}</div>
        </div>
      </div>

      <div className="header__search">
        <Search onSelect={onSearchSelect} />
      </div>

      <div className="header__controls">
        <select
          className="header__select"
          value={currentTheme}
          onChange={(e) => onThemeChange(e.target.value)}
        >
          {themes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <button className="header__button" onClick={showHelp}>
          ? Aide
        </button>
      </div>
    </header>
  );
};

export default Header;
