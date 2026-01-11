import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="text-foreground hover:bg-muted font-alata"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-alata text-foreground mb-4">
            Terms of <span className="gradient-text">Service</span>
          </h1>
          <p className="text-muted-foreground font-alata">Last updated: December 2025</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <h2 className="text-2xl font-alata text-foreground mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground font-alata mb-4">
              By accessing and using Investor Feed's services, including our website, mobile applications,
              and any associated tools, you accept and agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our services.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <h2 className="text-2xl font-alata text-foreground mb-4">2. Service Description</h2>
            <p className="text-muted-foreground font-alata mb-4">
              Investor Feed is an <strong className="text-foreground">information aggregation platform</strong> that:
            </p>
            <ul className="text-muted-foreground font-alata mb-4 list-disc pl-6">
              <li>Aggregates and displays publicly available corporate announcements and filings from stock exchanges</li>
              <li>Provides tools to filter, sort, and organize this publicly available information</li>
              <li>Offers a curated feed of updates from publicly listed companies</li>
            </ul>
            <p className="text-muted-foreground font-alata mb-4">
              We are a <strong className="text-foreground">technology platform providing tools</strong> to access and organize public information.
              We do not create, verify, or endorse the underlying data.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8 border-l-4 border-l-yellow-500">
            <h2 className="text-2xl font-alata text-foreground mb-4">3. Important Disclaimers</h2>

            <h3 className="text-xl font-alata text-yellow-400 mb-3">NOT INVESTMENT ADVICE</h3>
            <p className="text-muted-foreground font-alata mb-4">
              <strong className="text-foreground">Investor Feed does NOT provide investment advice, stock tips, recommendations,
              or suggestions of any kind.</strong> We are NOT SEBI registered investment advisors,
              research analysts, or portfolio managers. Nothing on this platform should be construed
              as a recommendation to buy, sell, or hold any security.
            </p>

            <h3 className="text-xl font-alata text-yellow-400 mb-3">DATA ACCURACY & SOURCE VERIFICATION</h3>
            <p className="text-muted-foreground font-alata mb-4">
              The information displayed on Investor Feed is sourced from publicly available data
              from stock exchanges and company filings. We provide source links wherever possible
              so you can verify information directly from official sources. However:
            </p>
            <ul className="text-muted-foreground font-alata mb-4 list-disc pl-6">
              <li>Company data and announcements may contain errors, omissions, or inaccuracies</li>
              <li>We do NOT guarantee the accuracy, completeness, timeliness, or reliability of any information</li>
              <li>Information may be outdated by the time you view it</li>
              <li>Technical issues may cause data to display incorrectly</li>
            </ul>
            <p className="text-muted-foreground font-alata mb-4 font-semibold">
              We provide source links for verification. You MUST use these links to independently verify
              all information from official sources (BSE, NSE, company websites, SEBI filings) before
              making any decisions. Do not rely solely on the information displayed on our platform.
            </p>

            <h3 className="text-xl font-alata text-yellow-400 mb-3">NO LIABILITY FOR INVESTMENT DECISIONS</h3>
            <p className="text-muted-foreground font-alata mb-4">
              <strong className="text-foreground">Investor Feed shall NOT be liable for any investment decisions you make.</strong> Any
              action you take based on information on this platform is strictly at your own risk.
              You are solely responsible for your own investment research and decisions.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <h2 className="text-2xl font-alata text-foreground mb-4">4. User Eligibility</h2>
            <p className="text-muted-foreground font-alata mb-4">To use our services, you must:</p>
            <ul className="text-muted-foreground font-alata mb-4 list-disc pl-6">
              <li>Be at least 18 years of age</li>
              <li>Have the legal capacity to enter into binding agreements</li>
              <li>Not be prohibited from using the services under applicable laws</li>
            </ul>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <h2 className="text-2xl font-alata text-foreground mb-4">5. Account Terms</h2>
            <p className="text-muted-foreground font-alata mb-4">If you create an account, you agree to:</p>
            <ul className="text-muted-foreground font-alata mb-4 list-disc pl-6">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security and confidentiality of your login credentials</li>
              <li>Not share your account with others or allow unauthorized access</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
            <p className="text-muted-foreground font-alata mb-4">
              We reserve the right to suspend or terminate accounts that violate these terms.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <h2 className="text-2xl font-alata text-foreground mb-4">6. Prohibited Activities</h2>
            <p className="text-muted-foreground font-alata mb-4">You agree NOT to:</p>
            <ul className="text-muted-foreground font-alata mb-4 list-disc pl-6">
              <li>Use automated tools, bots, or scrapers to access our services</li>
              <li>Attempt to circumvent security measures or access restrictions</li>
              <li>Redistribute, resell, or commercially exploit our content without permission</li>
              <li>Use our services for any illegal or unauthorized purpose</li>
              <li>Interfere with or disrupt our services or servers</li>
              <li>Impersonate others or misrepresent your affiliation</li>
              <li>Upload malicious code or attempt to hack our systems</li>
            </ul>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <h2 className="text-2xl font-alata text-foreground mb-4">7. Intellectual Property</h2>
            <p className="text-muted-foreground font-alata mb-4">
              The Investor Feed platform, including its design, features, and tools, is our proprietary
              property. The underlying financial data displayed is sourced from public filings and
              belongs to the respective companies and exchanges.
            </p>
            <p className="text-muted-foreground font-alata mb-4">
              You may not copy, modify, distribute, or create derivative works from our platform
              without explicit written permission.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <h2 className="text-2xl font-alata text-foreground mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground font-alata mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW:
            </p>
            <ul className="text-muted-foreground font-alata mb-4 list-disc pl-6">
              <li>
                Investor Feed provides services on an "AS IS" and "AS AVAILABLE" basis without
                warranties of any kind, express or implied
              </li>
              <li>
                We do NOT warrant that our services will be uninterrupted, error-free, or
                completely secure
              </li>
              <li>
                We shall NOT be liable for any direct, indirect, incidental, special, consequential,
                or punitive damages arising from:
                <ul className="list-disc pl-6 mt-2">
                  <li>Your use of or inability to use our services</li>
                  <li>Any errors, inaccuracies, or omissions in the data</li>
                  <li>Any investment or financial decisions made based on information on our platform</li>
                  <li>Unauthorized access to your account or data</li>
                  <li>Any third-party conduct on our platform</li>
                </ul>
              </li>
            </ul>
            <p className="text-muted-foreground font-alata mb-4 font-semibold">
              Our total liability for any claims shall not exceed the amount you paid us in the
              past 12 months, or INR 1,000, whichever is less.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <h2 className="text-2xl font-alata text-foreground mb-4">9. Indemnification</h2>
            <p className="text-muted-foreground font-alata mb-4">
              You agree to indemnify and hold harmless Investor Feed, its owners, employees, and
              affiliates from any claims, damages, losses, or expenses (including legal fees) arising
              from:
            </p>
            <ul className="text-muted-foreground font-alata mb-4 list-disc pl-6">
              <li>Your violation of these Terms</li>
              <li>Your use of our services</li>
              <li>Your investment decisions</li>
              <li>Any third-party claims related to your actions</li>
            </ul>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <h2 className="text-2xl font-alata text-foreground mb-4">10. Termination</h2>
            <p className="text-muted-foreground font-alata mb-4">
              We reserve the right to suspend or terminate your access to our services at any time,
              with or without cause, and with or without notice. Reasons for termination may include:
            </p>
            <ul className="text-muted-foreground font-alata mb-4 list-disc pl-6">
              <li>Violation of these Terms of Service</li>
              <li>Suspected fraudulent or illegal activity</li>
              <li>Extended period of inactivity</li>
              <li>Request by law enforcement or government agencies</li>
              <li>Discontinuation of our services</li>
            </ul>
            <p className="text-muted-foreground font-alata mb-4">
              You may also terminate your account at any time by contacting us.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <h2 className="text-2xl font-alata text-foreground mb-4">11. Modifications</h2>
            <p className="text-muted-foreground font-alata mb-4">
              We may modify these Terms at any time. Changes will be effective when posted on this page
              with an updated "Last updated" date. Your continued use of our services after changes
              constitutes acceptance of the modified Terms.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <h2 className="text-2xl font-alata text-foreground mb-4">12. Governing Law & Dispute Resolution</h2>
            <p className="text-muted-foreground font-alata mb-4">
              These Terms shall be governed by and construed in accordance with the laws of India.
            </p>
            <p className="text-muted-foreground font-alata mb-4">
              Any disputes arising from these Terms or your use of our services shall be subject to
              the exclusive jurisdiction of the courts in Ahmedabad, Gujarat, India.
            </p>
            <p className="text-muted-foreground font-alata mb-4">
              Before initiating legal proceedings, you agree to attempt to resolve disputes through
              good-faith negotiation by contacting us at the email address below.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <h2 className="text-2xl font-alata text-foreground mb-4">13. Severability</h2>
            <p className="text-muted-foreground font-alata mb-4">
              If any provision of these Terms is found to be unenforceable or invalid, that provision
              shall be limited or eliminated to the minimum extent necessary, and the remaining
              provisions shall remain in full force and effect.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border mb-8">
            <h2 className="text-2xl font-alata text-foreground mb-4">14. Contact Information</h2>
            <p className="text-muted-foreground font-alata mb-4">
              For questions about these Terms of Service, please contact us at:
              <br />
              <a href="mailto:investor@investorfeed.in" className="text-primary hover:underline">
                investor@investorfeed.in
              </a>
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link href="/">
            <span className="inline-flex items-center px-6 py-3 gradient-bg hover:opacity-90 text-black font-alata rounded-lg transition-all duration-200 cursor-pointer">
              Back to Home
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
