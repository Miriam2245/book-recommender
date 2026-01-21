export default function SelectField({
  placeholder,
  id,
  options,
  value,
  onChange,
}) {
  return (
    <section style={{ margin: "10px 0" }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        id={id}
        style={{
          width: "100%",
          padding: "8px",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((val) => (
          <option key={val} value={val}>
            {val}
          </option>
        ))}
      </select>
    </section>
  );
}
