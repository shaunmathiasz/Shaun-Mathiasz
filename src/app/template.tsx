export default function PageTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="page-arrival">{children}</div>;
}
