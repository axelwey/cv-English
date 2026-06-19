import "./admin.css";

export const metadata = {
  title: "Admin — CV",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
