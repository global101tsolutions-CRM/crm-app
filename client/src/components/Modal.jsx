import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function Modal({
  title,
  children,
  onClose,
  footer,
  maxWidth = 520,
  showHeader = true
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose?.();
      }
    };
    document.addEventListener("keydown", handleKey);
    const { body } = document;
    const originalOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  const handleBackdropClick = (event) => {
    if (event.target === containerRef.current) {
      onClose?.();
    }
  };

  return createPortal(
    <div
      ref={containerRef}
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      onMouseDown={handleBackdropClick}
    >
      <div className="modal-surface" style={{ maxWidth }}>
        {showHeader ? (
          <div className="modal-header">
            <h3>{title}</h3>
            <button type="button" className="ghost close" onClick={onClose} aria-label="Close dialog">
              ×
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="ghost close modal-close-floating"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        )}
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-footer">{footer}</div> : null}
      </div>
    </div>,
    document.body
  );
}
