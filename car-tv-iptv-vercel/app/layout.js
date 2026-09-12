import "./globals.css";

export const metadata = {
  title: "CAR TV",
  description: "Basit IPTV oynatıcı",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}