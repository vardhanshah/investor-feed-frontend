import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Bell, Filter, History, MessageSquare, Zap, Target, Users } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';

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
            About <span className="gradient-text">Investor Feed</span>
          </h1>
          <p className="text-xl text-muted-foreground font-alata max-w-2xl mx-auto leading-relaxed">
            Institutional-grade market intelligence, accessible to everyone.
          </p>
        </div>

        <div className="prose prose-invert max-w-none">
          {/* Why We Built This */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 shadow-lg border border-primary/20 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/20">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-alata text-foreground">Why We Built This</h2>
            </div>
            <p className="text-foreground/90 font-alata text-lg leading-relaxed">
              Retail investors often get critical information late — sometimes hours after institutions
              have already acted on it. By the time news hits mainstream channels, the opportunity has passed.
            </p>
            <p className="text-foreground/90 font-alata text-lg leading-relaxed mt-4">
              <strong className="text-foreground">We're changing that.</strong>
            </p>
          </div>

          {/* Mission Section */}
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <h2 className="text-2xl font-alata text-foreground mb-4">Our Mission</h2>
            <p className="text-muted-foreground font-alata mb-4 leading-relaxed">
              Investor Feed is built for serious investors and traders who understand that
              staying connected to market movements isn't optional — it's essential.
            </p>
            <p className="text-muted-foreground font-alata mb-4 leading-relaxed">
              We deliver <strong className="text-foreground">real-time company filings within 1-2 minutes</strong> of
              publication, with powerful filtering tools that let you focus on what matters to your portfolio.
              No noise. No delays. Just the information you need, when you need it.
            </p>
            <p className="text-muted-foreground font-alata leading-relaxed">
              Our vision goes further: helping you <strong className="text-foreground">uncover sector trends</strong>,
              <strong className="text-foreground"> trace company journeys</strong>, and <strong className="text-foreground">assess
              opportunities at a deeper level</strong> — capabilities that were once reserved for institutional desks.
            </p>
          </div>

          {/* Core Belief */}
          <div className="my-12 py-8 border-y border-border">
            <p className="text-2xl font-alata text-center text-foreground leading-relaxed">
              "Investment should be a <span className="gradient-text">level playing field</span>."
            </p>
          </div>

          {/* What You Can Do Section */}
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <h2 className="text-2xl font-alata text-foreground mb-6">What You Can Do</h2>
            <div className="grid gap-5">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-background/50 border border-border/50">
                <div className="p-2.5 rounded-lg bg-primary/10 flex-shrink-0">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-foreground font-alata font-medium mb-1">Real-Time Updates</h3>
                  <p className="text-muted-foreground font-alata text-sm leading-relaxed">
                    Live company filings delivered within 1-2 minutes — order announcements, capacity expansions,
                    financial results, board meetings, and more.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-background/50 border border-border/50">
                <div className="p-2.5 rounded-lg bg-primary/10 flex-shrink-0">
                  <Filter className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-foreground font-alata font-medium mb-1">Custom Feeds</h3>
                  <p className="text-muted-foreground font-alata text-sm leading-relaxed">
                    Build personalized feeds filtered by sector, company, update type, fundamentals,
                    and more. See only what's relevant to your investment thesis.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-background/50 border border-border/50">
                <div className="p-2.5 rounded-lg bg-primary/10 flex-shrink-0">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-foreground font-alata font-medium mb-1">Instant Notifications</h3>
                  <p className="text-muted-foreground font-alata text-sm leading-relaxed">
                    Subscribe to any feed and get notified the moment something important drops.
                    Never miss a market-moving announcement again.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-background/50 border border-border/50">
                <div className="p-2.5 rounded-lg bg-primary/10 flex-shrink-0">
                  <History className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-foreground font-alata font-medium mb-1">Historical Analysis</h3>
                  <p className="text-muted-foreground font-alata text-sm leading-relaxed">
                    Dive into company-wise historical filings. Trace patterns, understand timelines,
                    and build context for better decisions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-background/50 border border-border/50">
                <div className="p-2.5 rounded-lg bg-primary/10 flex-shrink-0">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-foreground font-alata font-medium mb-1">Discussion Threads</h3>
                  <p className="text-muted-foreground font-alata text-sm leading-relaxed">
                    Quality discussions that don't get buried. Engage with fellow investors
                    on specific filings without the noise of social media.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Twitter/X Presence - Social Proof */}
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-full bg-primary/10">
                <FaXTwitter className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-alata text-foreground">Trusted by Thousands</h2>
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
              Our X account has become a go-to source for real-time market updates — covering
              <strong className="text-foreground"> order wins</strong>,
              <strong className="text-foreground"> capacity expansions</strong>,
              <strong className="text-foreground"> management guidance</strong>, and
              <strong className="text-foreground"> financial results</strong> as they happen.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-background rounded-xl border border-border">
                <p className="text-2xl font-alata font-bold gradient-text">9.5K+</p>
                <p className="text-xs text-muted-foreground font-alata mt-1">Followers</p>
              </div>
              <div className="text-center p-4 bg-background rounded-xl border border-border">
                <p className="text-2xl font-alata font-bold gradient-text">13.4M</p>
                <p className="text-xs text-muted-foreground font-alata mt-1">Impressions</p>
              </div>
              <div className="text-center p-4 bg-background rounded-xl border border-border">
                <p className="text-2xl font-alata font-bold gradient-text">51K+</p>
                <p className="text-xs text-muted-foreground font-alata mt-1">Posts Shared</p>
              </div>
              <div className="text-center p-4 bg-background rounded-xl border border-border">
                <p className="text-2xl font-alata font-bold gradient-text">4.2%</p>
                <p className="text-xs text-muted-foreground font-alata mt-1">Engagement</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground font-alata text-center mb-6">
              Join the community of investors who refuse to be the last to know.
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

          {/* Data Sources */}
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-alata text-foreground">Our Data</h2>
            </div>
            <p className="text-muted-foreground font-alata mb-4 leading-relaxed">
              We aggregate official corporate filings and announcements from publicly available sources,
              delivering them to you within minutes of publication.
            </p>
            <p className="text-sm text-muted-foreground font-alata italic">
              Disclaimer: Investor Feed provides information for educational purposes only.
              We do not offer investment advice. Always do your own research before making investment decisions.
            </p>
          </div>

          {/* Contact Section */}
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-alata text-foreground">Get In Touch</h2>
            </div>
            <p className="text-muted-foreground font-alata mb-6 leading-relaxed">
              We're constantly improving Investor Feed based on what investors actually need.
              Got feedback, feature requests, or just want to say hello? We'd love to hear from you.
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
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground font-alata mb-4">
            Ready to stay ahead of the market?
          </p>
          <Link href="/">
            <span className="inline-flex items-center px-8 py-4 gradient-bg hover:opacity-90 text-black font-alata text-lg rounded-lg transition-all duration-200 cursor-pointer">
              Start Exploring
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
