import type { Metadata } from "next"
import { Check, Shield, Zap, Globe, BarChart3, Star } from "lucide-react"

export const metadata: Metadata = {
  title: "Pricing - Human Traffic Filter Pro",
  description: "Choose the perfect plan for your traffic filtering and bot protection needs",
}

const plans = [
  {
    name: "Basic",
    price: "$29",
    period: "/month",
    description: "Perfect for small websites and startups",
    features: [
      "Up to 3 websites",
      "100K requests/month",
      "Basic bot detection",
      "Geographic filtering",
      "Email support",
      "Dashboard analytics",
    ],
    buttonText: "Start Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    price: "$79",
    period: "/month",
    description: "Best for growing businesses and agencies",
    features: [
      "Up to 15 websites",
      "1M requests/month",
      "Advanced ML bot detection",
      "Real-time monitoring",
      "Campaign management",
      "API access",
      "Priority support",
      "Custom rules",
    ],
    buttonText: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$299",
    period: "/month",
    description: "For large-scale operations and agencies",
    features: [
      "Unlimited websites",
      "Unlimited requests",
      "White-label solution",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantee",
      "Advanced analytics",
      "Custom AI training",
    ],
    buttonText: "Contact Sales",
    popular: false,
  },
]

const features = [
  {
    icon: Shield,
    title: "Advanced Bot Protection",
    description: "AI-powered detection blocks 99.9% of bots and scrapers",
  },
  {
    icon: Globe,
    title: "Geographic Filtering",
    description: "Control traffic by country and region with precision",
  },
  {
    icon: Zap,
    title: "Real-time Processing",
    description: "Lightning-fast filtering with minimal latency impact",
  },
  {
    icon: BarChart3,
    title: "Detailed Analytics",
    description: "Comprehensive insights into your traffic patterns",
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Traffic Filter Pro</h1>
            </div>
            <nav className="flex space-x-8">
              <a href="/" className="text-gray-600 hover:text-gray-900">
                Home
              </a>
              <a href="/pricing" className="text-blue-600 font-medium">
                Pricing
              </a>
              <a href="/contact" className="text-gray-600 hover:text-gray-900">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Choose the perfect plan for your traffic filtering needs. All plans include our core bot protection
            features.
          </p>
          <div className="flex items-center justify-center space-x-2 mb-12">
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-gray-600">14-day free trial</span>
            <Check className="h-5 w-5 text-green-600 ml-4" />
            <span className="text-gray-600">No setup fees</span>
            <Check className="h-5 w-5 text-green-600 ml-4" />
            <span className="text-gray-600">Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl shadow-lg p-8 ${
                  plan.popular ? "ring-2 ring-blue-500 scale-105" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-1">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features Included</h2>
            <p className="text-xl text-gray-600">
              Every plan includes our comprehensive traffic filtering capabilities
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How does the free trial work?</h3>
              <p className="text-gray-600">
                Start with a 14-day free trial with full access to all features. No credit card required.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I change plans at any time?</h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What happens if I exceed my request limit?</h3>
              <p className="text-gray-600">
                We'll notify you before you reach your limit and offer options to upgrade or purchase additional
                capacity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Protect Your Traffic?</h2>
          <p className="text-xl text-blue-100 mb-8">Join thousands of websites already using Traffic Filter Pro</p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            Start Your Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-blue-400 mr-2" />
              <span className="font-bold">Traffic Filter Pro</span>
            </div>
            <div className="text-gray-400 text-sm">© 2024 Traffic Filter Pro. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
