export default function GovernorateSelect({
  governorates,
  value,
  onChange,
  placeholder,
  className,
  showArName = false,
}) {
  return (
    <select value={value} onChange={onChange} className={className}>
      <option value="">{placeholder}</option>
      {governorates.map((governorate) => (
        <option key={governorate.id} value={governorate.id}>
          {showArName ? `${governorate.enName} - ${governorate.arName}` : governorate.enName}
        </option>
      ))}
    </select>
  );
}