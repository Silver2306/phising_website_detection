import './globals.css';

export const metadata = {
  title: 'PhisSafe - Phishing Website Detection System',
  description: 'Protecting everyone from Phishing',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
