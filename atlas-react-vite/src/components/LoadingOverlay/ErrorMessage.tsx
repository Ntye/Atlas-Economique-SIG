import { type FC } from 'react';

interface ErrorMessageProps {
  isVisible: boolean;
  message?: string;
  onRetry?: () => void;
}

const ErrorMessage: FC<ErrorMessageProps> = ({
  isVisible,
  message = "Une erreur s'est produite",
  onRetry,
}) => {
  return (
    <div className={`error-message ${isVisible ? 'error-message--active' : ''}`}>
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-primary retry-btn" onClick={onRetry}>
          Reessayer
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
