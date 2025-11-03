interface AppHeaderProps {
  title?: string;
  showLogo?: boolean;
}

export const AppHeader = ({ title, showLogo = true }: AppHeaderProps) => {
  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-center">
        {showLogo && (
          <h1 className="text-3xl font-koi-script text-primary">koi</h1>
        )}
        {title && !showLogo && (
          <h1 className="text-xl font-koi-script text-primary">{title}</h1>
        )}
      </div>
    </header>
  );
};
