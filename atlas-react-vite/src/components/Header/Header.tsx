import { type FC, useEffect, useState } from 'react';
import { api } from '../../services/api';
import Search from '../Search';
import type { HeaderData, SearchResult } from '../../interfaces';

interface HeaderProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  onMenuToggle: () => void;
  onSearchSelect: (result: SearchResult) => void;
  onStatsToggle: () => void;
  isStatsActive: boolean;
  onHelpToggle: () => void;
}

const Header: FC<HeaderProps> = ({ currentTheme, onThemeChange, onMenuToggle, onSearchSelect, onStatsToggle, isStatsActive, onHelpToggle  }) => {
  const [data, setData] = useState<HeaderData | null>(null);

  useEffect(() => {
    api.getHeader().then(setData).catch(() => {
      setData({
        titre: 'Atlas Economique du Cameroun',
        sousTitre: 'Visualisation des productions',
        version: '1.0.0',
        themes: [],
        langues: [],
      });
    });
  }, []);

  return (
      <header className="header">
        <div className="header__logo">
          <button className="header__menu-btn" onClick={onMenuToggle}>
            &#9776;
          </button>
          <div>
            <h1 className="header__title">{data?.titre || 'Atlas Economique du Cameroun'}</h1>
            <div className="header__tagline">{data?.sousTitre || 'Analyse spatiale des secteurs'}</div>
          </div>
        </div>

        <div className="header__search">
          <Search onSelect={onSearchSelect} />
        </div>

        <div className="header__controls">

          <div className="header__select-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-layer-group" style={{ fontSize: '0.8rem', opacity: 0.8 }}></i>
            <select
                className="header__select"
                value={currentTheme}
                onChange={(e) => onThemeChange(e.target.value)}
            >
              <option value="tous">Vue Administrative</option>
              <option value="agriculture">Secteur Agriculture</option>
              <option value="elevage">Secteur Élevage</option>
              <option value="peche">Secteur Pêche</option>
            </select>
          </div>

          <button
              className={`header__button ${isStatsActive ? 'active' : ''}`}
              onClick={onStatsToggle}
              title="Afficher les statistiques"
              style={{ backgroundColor: isStatsActive ? 'var(--color-secondary)' : 'rgba(255,255,255,0.15)' }}
          >
            <i className="fas fa-chart-bar"></i> Stats
          </button>

          <button className="header__button" onClick={onHelpToggle} title="Centre d'aide">
            <i className="fas fa-question-circle"></i> Aide
          </button>
        </div>
      </header>
  );
};

export default Header;