import { Link } from "react-router-dom";

export default function SectionHeader({ title, href, linkLabel, className = "" }) {
  return (
    <div className={`mb-6 flex items-end justify-between gap-4 ${className}`}>
      <h2 className="section-title">{title}</h2>
      {href && linkLabel && (
        <Link to={href} className="shrink-0 text-meta font-semibold text-link transition hover:text-link-hover">
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}
