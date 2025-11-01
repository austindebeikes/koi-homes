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
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center">
              <img src={koiLogo} alt="koi" className="h-10 w-10" />
            </div>
            <h1 className="text-3xl font-koi font-semibold text-primary">koi</h1>
          </div>
        )}
        {title && !showLogo && (
          <h1 className="text-xl font-semibold">{title}</h1>
        )}
      </div>
    </header>
  );
};
