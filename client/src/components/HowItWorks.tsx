import { UserPlus, Settings, TrendingUp } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create Your Account",
    description: "Sign up in 30 seconds. Quick and easy, no hassle.",
    color: "from-purple-500 to-purple-600",
  },
  {
    number: "02",
    icon: Settings,
    title: "Create Your Feed",
    description: "Pick companies, sectors, and update types. Build feeds that matter to you.",
    color: "from-cyan-500 to-cyan-600",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Stay Ahead",
    description: "Get notified before the market reacts. Make informed decisions faster.",
    color: "from-pink-500 to-pink-600",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative text-center animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Connector Line (hidden on mobile, shown between items on desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-border to-border/50" />
              )}

              {/* Step Number */}
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${step.color} p-0.5`}>
                  <div className="w-full h-full bg-card rounded-2xl flex items-center justify-center">
                    <step.icon className="w-10 h-10 text-foreground" />
                  </div>
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-alata font-bold text-sm">
                  {step.number}
                </span>
              </div>

              {/* Content */}
              <h3 className="text-xl font-alata text-foreground font-medium mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground font-alata leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
