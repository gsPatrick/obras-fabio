// app/(auth)/layout.js

export default function AuthLayout({ children }) {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 p-4">
      {children}
    </main>
  );
}