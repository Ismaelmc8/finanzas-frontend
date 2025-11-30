export function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`bg-white shadow-md rounded-2xl ${className}`} {...props} >
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
