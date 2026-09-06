// shared/components/NumberInput.jsx
export default function NumberInput({ className = "", ...props }) {
  return (
    <input
      type="number"
      step={1}
      onKeyDown={(e) => {
        if (["e", "E", "+", "-", "."].includes(e.key)) {
          e.preventDefault();
        }
      }}
      onPaste={(e) => {
        const pasted = e.clipboardData.getData("text");
        if (!/^\d+$/.test(pasted)) e.preventDefault();
      }}
      onWheel={(e) => e.target.blur()}
      className={className}
      {...props}
    />
  );
}