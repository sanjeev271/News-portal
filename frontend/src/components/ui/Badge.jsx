const variants = {
  breaking: "badge-breaking",
  live: "badge-live",
  category: "badge-category",
  new: "badge-new",
  pinned: "badge-muted",
  video: "badge-muted",
};

export default function Badge({ variant = "category", children, className = "" }) {
  return (
    <span className={`${variants[variant] || variants.category} ${className}`}>
      {children}
    </span>
  );
}
