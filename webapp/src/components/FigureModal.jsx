import { useEffect } from 'react';
import { X } from 'lucide-react';

function FigureModal({ figure, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!figure) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="figure-modal"
        role="dialog"
        aria-modal="true"
        aria-label={figure.title}
        onClick={(event) => event.stopPropagation()}
      >
        <button className="icon-button modal-close" type="button" onClick={onClose} aria-label="Close figure">
          <X size={22} />
        </button>
        <img src={figure.src} alt={figure.title} />
      </div>
    </div>
  );
}

export default FigureModal;
