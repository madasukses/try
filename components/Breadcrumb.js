import Link from 'next/link';

export default function Breadcrumb({ items }) {
  return (
    <nav className="text-sm text-slate-500 mb-3 flex items-center flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {item.href ? (
            <Link href={item.href} className="hover:text-blue-600">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-500">{item.label}</span>
          )}
          {i < items.length - 1 && <span className="text-slate-300">›</span>}
        </span>
      ))}
    </nav>
  );
}
