import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Bell, Filter, History, Search, TrendingUp, Users } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';
import SEO from '@/components/SEO';

export default function About() {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      setLocation('/');
    }
  };

  return (
    <>
      <SEO
        title="About"
        description="Every Indian corporate filing — readable, filterable, discoverable. See through the noise. Stay ahead."
        canonical="/about"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'About', url: '/about' },
        ]}
      />
      <div className="min-h-screen bg-background text-foreground py-20 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-foreground hover:bg-muted font-alata"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-alata text-foreground mb-6">
            Every Filing. <span className="gradient-text">Readable.</span> Filterable. Discoverable.
          </h1>
          <p className="text-xl text-muted-foreground font-alata max-w-2xl mx-auto leading-relaxed">
            See through the noise. Stay ahead.
          </p>
        </div>

        <div className="space-y-8">
          {/* The Problem */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 shadow-lg border border-primary/20">
            <p className="text-foreground/90 font-alata text-lg leading-relaxed">
              Corporate filings contain critical signals — orders, expansions, results, board decisions.
              But raw filings are dense, scattered, and hard to track.
              <strong className="text-foreground"> We built Investor Feed to fix this.</strong>
            </p>
          </div>

          {/* What Investor Feed Does */}
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
            <h2 className="text-2xl font-alata text-foreground mb-6">What Investor Feed Does</h2>
            <div className="grid gap-5">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-background/50 border border-border/50">
                <div className="p-2.5 rounded-lg bg-primary/10 flex-shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-foreground font-alata font-medium mb-1">Readable Updates</h3>
                  <p className="text-muted-foreground font-alata text-sm leading-relaxed">
                    Every filing summarized and categorized. No more wading through dense documents.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-background/50 border border-border/50">
                <div className="p-2.5 rounded-lg bg-primary/10 flex-shrink-0">
                  <Filter className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-foreground font-alata font-medium mb-1">Powerful Filters</h3>
                  <p className="text-muted-foreground font-alata text-sm leading-relaxed">
                    Filter by company, sector, update type, and more. See only what's relevant to your research.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-background/50 border border-border/50">
                <div className="p-2.5 rounded-lg bg-primary/10 flex-shrink-0">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-foreground font-alata font-medium mb-1">Instant Alerts</h3>
                  <p className="text-muted-foreground font-alata text-sm leading-relaxed">
                    Get notified the moment relevant updates drop. Never miss what matters.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-background/50 border border-border/50">
                <div className="p-2.5 rounded-lg bg-primary/10 flex-shrink-0">
                  <History className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-foreground font-alata font-medium mb-1">Complete Archive</h3>
                  <p className="text-muted-foreground font-alata text-sm leading-relaxed">
                    Every filing, searchable and sortable. Nothing gets buried.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What You Can Discover */}
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
            <h2 className="text-2xl font-alata text-foreground mb-6">What You Can Discover</h2>
            <div className="grid gap-6">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-primary/10 flex-shrink-0">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-foreground font-alata font-medium mb-2">Track a Company's Journey</h3>
                  <p className="text-muted-foreground font-alata text-sm leading-relaxed">
                    Pull up a year of filings for any company. See how management has executed — expansions, orders, results, key decisions — all in one timeline.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-primary/10 flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-foreground font-alata font-medium mb-2">Spot Sector Trends</h3>
                  <p className="text-muted-foreground font-alata text-sm leading-relaxed">
                    When multiple companies in a sector announce order wins or capacity additions, it signals something bigger. Filter by sector and update type to see patterns emerge.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-primary/10 flex-shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-foreground font-alata font-medium mb-2">Find What Others Missed</h3>
                  <p className="text-muted-foreground font-alata text-sm leading-relaxed">
                    Not every filing makes headlines. Filter through historical updates to surface opportunities that flew under the radar.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Our Data */}
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
            <h2 className="text-2xl font-alata text-foreground mb-4">Our Data</h2>
            <p className="text-muted-foreground font-alata leading-relaxed">
              Company filings — the regulatory disclosures that listed companies are required to publish.
              Every filing is summarized, categorized, and delivered within minutes of publication.
              Document previews included.
            </p>
          </div>

          {/* Twitter/X Presence */}
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-full bg-primary/10">
                <FaXTwitter className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-alata text-foreground">Follow Us</h2>
                <a
                  href="https://x.com/_Investor_Feed_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-alata"
                >
                  @_Investor_Feed_
                </a>
              </div>
            </div>

            <p className="text-muted-foreground font-alata mb-6 leading-relaxed">
              Real-time market updates on X — order wins, capacity expansions, management guidance, and financial results as they happen.
            </p>

            <div className="text-center">
              <a
                href="https://x.com/_Investor_Feed_"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background font-alata rounded-lg hover:opacity-90 transition-all duration-200"
              >
                <FaXTwitter className="h-4 w-4" />
                Follow @_Investor_Feed_
              </a>
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-alata text-foreground">Get In Touch</h2>
            </div>
            <p className="text-muted-foreground font-alata mb-6 leading-relaxed">
              Got feedback or ideas? We'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="mailto:investor@investorfeed.in"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-lg text-foreground font-alata hover:bg-muted transition-colors"
              >
                investor@investorfeed.in
              </a>
              <a
                href="https://x.com/_Investor_Feed_"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-lg text-foreground font-alata hover:bg-muted transition-colors"
              >
                <FaXTwitter className="h-4 w-4" />
                DM us on X
              </a>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground font-alata italic">
              Investor Feed provides information for educational purposes only.
              We do not offer investment advice. Always do your own research.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link href="/">
            <span className="inline-flex items-center px-8 py-4 gradient-bg hover:opacity-90 text-black font-alata text-lg rounded-lg transition-all duration-200 cursor-pointer">
              Start Exploring
            </span>
          </Link>
        </div>
      </div>
      </div>
    </>
  );
}
