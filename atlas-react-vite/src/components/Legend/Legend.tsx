import { type FC, useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { LegendData } from '../../interfaces';

interface LegendProps {
  theme: string;
  secteur?: string;
}

const SECTEUR_LEGEND: Record<string, { couleur: string; label: string; icone: string }> = {
  agriculture: { couleur: '#4CAF50', label: 'Agriculture', icone: '🌾' },
  elevage: { couleur: '#FF9800', label: 'Elevage', icone: '🐄' },
  peche: { couleur: '#2196F3', label: 'Peche', icone: '🐟' },
};

const Legend: FC<LegendProps> = ({ theme, secteur }) => {
  const [data, setData] = useState<LegendData | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    api
      .getLegend(theme)
      .then(setData)
      .catch((err) => console.error('Legend load error:', err));
  }, [theme]);

  const renderSecteurLegend = () => {
    if (!secteur || secteur === 'all' || theme !== 'tous') return null;

    const info = SECTEUR_LEGEND[secteur];
    if (!info) return null;

    return (
      <>
        <h4 className="legend__title">Secteur: {info.label}</h4>
        <div className="legend__content">
          <div className="legend__item">
            <span className="legend__color" style={{ background: info.couleur, opacity: 0.8 }} />
            <span className="legend__label">{info.icone} Secteur principal</span>
          </div>
          <div className="legend__item">
            <span className="legend__color" style={{ background: '#e0e0e0', opacity: 0.5 }} />
            <span className="legend__label">Autres secteurs</span>
          </div>
          <div className="legend__item">
            <span
              className="legend__color"
              style={{ background: '#333', opacity: 1, height: '3px' }}
            />
            <span className="legend__label">Zone selectionnee</span>
          </div>
        </div>
      </>
    );
  };

  const renderDefaultLegend = () => {
    if (secteur && secteur !== 'all' && theme === 'tous') return null;
    if (!data) return null;

    return (
      <>
        <h4 className="legend__title">{data.titre}</h4>
        <div className="legend__content" style={{ display: isVisible ? 'block' : 'none' }}>
          {data.items.map((item, index) => (
            <div className="legend__item" key={index}>
              <span
                className="legend__color"
                style={{ background: item.couleur, opacity: item.opacite || 0.7 }}
              />
              <span className="legend__label">{item.label}</span>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="legend">
      <button className="legend__toggle" onClick={() => setIsVisible(!isVisible)}>
        👁
      </button>
      {renderSecteurLegend()}
      {renderDefaultLegend()}
    </div>
  );
};

export default Legend;
