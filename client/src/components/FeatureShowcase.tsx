import { Building2, PieChart, Calculator, Filter, Bell, History } from "lucide-react";

const features = [
  {
    icon: Building2,
    title: "By Company",
    description: "Select specific companies to track in your feed.",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
  {
    icon: PieChart,
    title: "By Sector",
    description: "Filter by sectors and sub-sectors like IT, Pharma, Banking.",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
  },
  {
    icon: Calculator,
    title: "Company Fundamentals",
    description: "Filter by Market Cap, P/E Ratio, ROE, P/B Ratio.",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
  },
  {
    icon: Filter,
    title: "Update Filters",
    description: "Growth, Orders, Capacity Expansion, Revenue, Guidance & more.",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
  },
  {
    icon: Bell,
    title: "Push Notifications",
    description: "Get notified instantly when new updates match your feeds.",
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/30",
  },
  {
    icon: History,
    title: "Historical Updates",
    description: "Access past filings and updates for any company.",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
];

export default function FeatureShowcase() {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-alata text-foreground mb-4">
            Everything You Need to{' '}
            <span className="gradient-text">Stay Ahead</span>
          </h2>
          <p className="text-muted-foreground font-alata max-w-2xl mx-auto text-lg">
            Powerful features designed for serious investors who don't want to miss a beat.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="p-6 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 hover:transform hover:scale-[1.02] animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 ${feature.bgColor} ${feature.borderColor} border rounded-xl mb-4`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-alata text-foreground font-medium mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground font-alata leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
