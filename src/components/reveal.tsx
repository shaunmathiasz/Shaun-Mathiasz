/** Server-rendered content; the shared observer adds nonessential motion. */
export function Reveal({ children }: { children: React.ReactNode }) {
  return <div className="motion-reveal" data-cinematic>{children}</div>;
}
