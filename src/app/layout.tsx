'use client';
import './globals.css'
import Header from './components/Header';
import { AuthProvider } from './context/AuthContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {


  return (
    <html lang="en">
      <body>
      <AuthProvider>
        <Header />
        <main>
          {children}
        </main>
      </AuthProvider>
      </body>
    </html>
  );
}
