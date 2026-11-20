export default function Field({ label, error, hint, required, children }) {
  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      <label>
        {label}
        {required && <span className="field-required"> *</span>}
      </label>
      {children}
      {error ? (
        <span className="field-error">{error}</span>
      ) : hint ? (
        <span className="field-hint">{hint}</span>
      ) : null}
    </div>
  );
}
