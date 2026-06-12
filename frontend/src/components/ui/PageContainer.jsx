export default function PageContainer({ children, className = "", as: Tag = "div", narrow = false }) {
  return (
    <Tag
      className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${narrow ? "max-w-5xl" : "max-w-7xl"} ${className}`}
    >
      {children}
    </Tag>
  );
}
