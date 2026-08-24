import './globals.css';

export const metadata = {
  title: 'AE Tier Testing',
  description: 'Allen Elliott Fitness — quarterly tier testing',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
