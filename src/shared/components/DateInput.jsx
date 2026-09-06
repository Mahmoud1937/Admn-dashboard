export default function DateInput({ className = "", ...props }) {
  return <input type="date" lang="en-GB" className={className} {...props} />;
}