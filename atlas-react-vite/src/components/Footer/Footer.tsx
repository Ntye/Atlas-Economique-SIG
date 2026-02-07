import { type FC, useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { FooterData } from '../../interfaces';

interface FooterProps {
  isSidebarOpen: boolean;
}

const Footer: FC<FooterProps> = ({ isSidebarOpen }) => {
  const [data, setData] = useState<FooterData | null>(null);

  useEffect(() => {
    api
      .getFooter()
      .then(setData)
      .catch(() => {
        setData({
          credits: '© 2026 Projet 5GI',
          sources: [],
          derniereMAJ: '',
          contact: { email: '', github: '' },
        });
      });
  }, []);

  const sourcesText = data?.sources.map((s) => s.nom).join(', ') || '';

  return (
    <footer className={`footer ${!isSidebarOpen ? 'footer--full' : ''}`}>
      <div className="footer__credits">{data?.credits || '© 2026 Projet 5GI'}</div>
      <div className="footer__info">
        {data?.derniereMAJ && <span>Derniere mise a jour: {data.derniereMAJ}</span>}
        {sourcesText && (
          <>
            <span> | </span>
            <span>Sources: {sourcesText}</span>
          </>
        )}
      </div>
    </footer>
  );
};

export default Footer;
