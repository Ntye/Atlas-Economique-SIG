import { type FC } from 'react';
import './LoadingOverlay.css';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

const LoadingOverlay: FC<LoadingOverlayProps> = ({ isVisible, message = 'Chargement des donnees...' }) => {
  if (!isVisible) return null;

  return (
    <div className="loading-overlay loading-overlay--active">
      <div className="loading-overlay__spinner" />
      <div className="loading-overlay__text">{message}</div>
    </div>
  );
};

export default LoadingOverlay;
