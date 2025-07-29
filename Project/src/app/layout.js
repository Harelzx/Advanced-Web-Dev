import "./globals.css";
import { ThemeProvider } from "./components/ThemeContext";
import ThemeWrapper from "./components/ThemeWrapper";
import AppShell from "./components/AppShell";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <ThemeWrapper>
            <AppShell>
              {children}
            </AppShell>
          </ThemeWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}