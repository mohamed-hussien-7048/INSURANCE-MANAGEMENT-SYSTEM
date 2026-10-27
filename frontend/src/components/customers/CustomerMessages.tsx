interface CustomerMessagesProps {
  error: string;
  notice: string;
  onClearError: () => void;
  onClearNotice: () => void;
}

export function CustomerMessages({
  error,
  notice,
  onClearError,
  onClearNotice,
}: CustomerMessagesProps) {
  return (
    <>
      {error && (
        <div className="alert alert-error" role="alert">
          <span>{error}</span>
          <button
            className="alert-action"
            type="button"
            onClick={onClearError}
          >
            إغلاق
          </button>
        </div>
      )}

      {notice && (
        <div className="alert alert-success" role="status">
          <span>{notice}</span>
          <button
            className="alert-action"
            type="button"
            onClick={onClearNotice}
          >
            إغلاق
          </button>
        </div>
      )}
    </>
  );
}