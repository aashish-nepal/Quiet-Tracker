import './globals.css';
import CookieBanner from '../components/ui/CookieBanner';

export const metadata = {
  title: 'Quiet Tracker | Revenue Protection Intelligence',
  description: 'Pricing intelligence for e-commerce teams. Monitor competitor prices, catch undercuts early, and respond with screenshot proof.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" style={{ colorScheme: 'dark' }}>
      <body className="font-sans antialiased bg-base text-primary">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}

