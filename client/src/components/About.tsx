import { TrendingUp } from "lucide-react";

export default function About() {
  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-5xl font-alata text-gray-900 mb-8">
            Cut Through the Noise
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-xl font-alata text-gray-700 leading-relaxed">
                In today's fast-paced financial markets, information overload is real. 
                We curate the most relevant insights to help you make informed investment decisions.
              </p>
              <p className="text-xl font-alata text-gray-700 leading-relaxed">
                Our mission is simple: deliver clarity in complexity, signal through noise.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 w-full max-w-sm">
                <div className="flex items-center justify-center h-48">
                  <TrendingUp className="w-24 h-24" style={{ color: 'hsl(258, 60%, 52%)' }} />
                </div>
                <div className="text-center mt-4">
                  <p className="text-sm font-alata text-gray-600">Clear insights, actionable data</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
