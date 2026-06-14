export const DeveloperFooter = () => {
  return (
    <footer className="border-t border-white/5 bg-black/20 py-4 px-6 mt-auto">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span>CodeCraft Admin Panel</span>
        </div>
        <div className="flex items-center gap-4">
          <span>© 2026</span>
          <a
            href="https://github.com/AR128"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400/70 hover:text-cyan-300 transition-colors font-medium"
          >
            Engineered by Ayush Choudhary
          </a>
        </div>
      </div>
    </footer>
  );
};
