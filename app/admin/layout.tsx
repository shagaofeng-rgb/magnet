import "./admin.css";

export const metadata = { robots: { index: false, follow: false }, title: "BZMAGNET Admin" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="admin">{children}</div>;
}
