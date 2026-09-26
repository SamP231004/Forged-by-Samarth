/**
 * Templates remount on every navigation, so this CSS-only fade replays
 * between routes without waiting for JavaScript (keeps LCP fast).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
