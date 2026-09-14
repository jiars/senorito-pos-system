const FloatingInput = ({
  id,
  label,
  type,
  value,
  onChange,
  autoComplete,
  endAction,
}) => {
  let fieldClassName = 'login-floating-field';

  if (value !== '') {
    fieldClassName += ' login-floating-field--filled';
  }

  return (
    <div className={fieldClassName}>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        aria-label={label}
      />
      <label htmlFor={id}>{label}</label>
      {endAction}
    </div>
  );
};

export default FloatingInput;
