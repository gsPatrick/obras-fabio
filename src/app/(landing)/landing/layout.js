// app/(landing)/layout.js

export default function LandingLayout({ children }) {
  return (
    <div className="bg-white dark:bg-gray-950">
      {/* Aqui podemos adicionar um Header e Footer específicos da landing page */}
      {children}
    </div>
  );
}