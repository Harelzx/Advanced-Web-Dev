export default function Badge({ label, color = "bg-green-500" }) {
  return (
    <span className={`inline-block px-3 py-1 text-xs font-semibold text-white rounded-full ${color} mr-2`}>
      {label}
    </span>
  );
}