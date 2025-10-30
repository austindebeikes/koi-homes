import koiLogo from '@/assets/koi-logo.png';

interface AppHeaderProps {
  title?: string;
  showLogo?: boolean;
}

export const AppHeader = ({ title, showLogo = true }: AppHeaderProps) => {
  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-center">
        {showLogo && (
          <div className="flex items-center gap-2">
            <img src={koiLogo} alt="Koi" className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Koi</h1>
          </div>
        )}
        {title && !showLogo && (
          <h1 className="text-xl font-semibold">{title}</h1>
        )}
      </div>
    </header>
  );
};
