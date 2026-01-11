import { Link } from 'wouter';

export default function GlobalFooter() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 py-3 px-4 bg-background/95 backdrop-blur-sm border-t border-border">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground font-alata order-2 sm:order-1">
          © 2026 Investor Feed
        </p>
        <nav aria-label="Legal and company links" className="flex items-center gap-3 text-xs text-muted-foreground font-alata order-1 sm:order-2">
          <Link href="/terms" className="hover:text-primary transition-colors">
            Terms of Service
          </Link>
          <span aria-hidden="true" className="text-muted-foreground/50">|</span>
          <Link href="/privacy" className="hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <span aria-hidden="true" className="text-muted-foreground/50">|</span>
          <Link href="/cookies" className="hover:text-primary transition-colors">
            Cookie Policy
          </Link>
          <span aria-hidden="true" className="text-muted-foreground/50">|</span>
          <Link href="/about" className="hover:text-primary transition-colors">
            About
          </Link>
        </nav>
      </div>
    </footer>
  );
}
