import "./globals.css";
import ThemeProvider from "./theme-provider";

export const metadata = {
  title: "Chill",
  description: "Chill social platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-bg text-text dark:bg-bg-dark dark:text-text-dark transition-colors duration-300">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
