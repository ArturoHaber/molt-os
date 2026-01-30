"use client";

import { useState } from "react";

const verticals = [
  {
    title: "The Executive",
    emoji: "💼",
    description: "Inbox zero on autopilot. Meeting prep, email triage, and daily briefings—handled.",
    features: ["Email summaries", "Calendar management", "Meeting prep docs"],
    color: "from-blue-500 to-indigo-600",
  },
  {
    title: "The Developer",
    emoji: "👨‍💻",
    description: "Your AI pair programmer. Monitors PRs, runs commands, debugs with you.",
    features: ["GitHub integration", "CI/CD monitoring", "Code reviews"],
    color: "from-green-500 to-emerald-600",
  },
  {
    title: "The Researcher",
    emoji: "🔬",
    description: "Deep dives without drowning. Summarizes papers, tracks topics, finds insights.",
    features: ["Web research", "Document analysis", "Knowledge synthesis"],
    color: "from-purple-500 to-violet-600",
  },
  {
    title: "The Creator",
    emoji: "🎨",
    description: "Your creative co-pilot. Brainstorms, schedules posts, tracks your audience.",
    features: ["Content calendar", "Social scheduling", "Analytics tracking"],
    color: "from-orange-500 to-red-500",
  },
];

const steps = [
  {
    number: "1",
    title: "Sign Up",
    description: "Create your account in seconds. No credit card required to start.",
  },
  {
    number: "2",
    title: "Choose Your Flavor",
    description: "Pick a preset that fits your workflow—or customize your own.",
  },
  {
    number: "3",
    title: "Start Chatting",
    description: "Your AI is ready. No setup, no config files, no API keys.",
  },
];

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to backend
    console.log("Waitlist signup:", email);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold">
            <span className="text-orange-500">Molt</span>-OS
          </div>
          <a
            href="#waitlist"
            className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg font-medium transition"
          >
            Join Waitlist
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            AI that works for you,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
              not the other way around.
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Your personal AI assistant, fully managed. No terminals, no API keys, no config files.
            Just sign in and chat.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#waitlist"
              className="bg-orange-500 hover:bg-orange-600 px-8 py-4 rounded-xl text-lg font-semibold transition transform hover:scale-105"
            >
              Get Early Access
            </a>
            <a
              href="#how-it-works"
              className="border border-gray-600 hover:border-gray-500 px-8 py-4 rounded-xl text-lg font-semibold transition"
            >
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Social Proof Placeholder */}
      <section className="py-12 border-y border-gray-800 bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm uppercase tracking-wider mb-4">Trusted by early adopters</p>
          <div className="flex justify-center gap-8 text-gray-600">
            <span>🚀 500+ on waitlist</span>
            <span>⭐ Powered by Clawdbot</span>
            <span>🔒 Private & Secure</span>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Up and running in 60 seconds
          </h2>
          <p className="text-gray-400 text-center mb-16 max-w-xl mx-auto">
            We handle the infrastructure. You just chat.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verticals */}
      <section id="verticals" className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Pre-configured for your workflow
          </h2>
          <p className="text-gray-400 text-center mb-16 max-w-xl mx-auto">
            Pick a preset that matches how you work. Or build your own.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {verticals.map((v) => (
              <div
                key={v.title}
                className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 hover:border-gray-600 transition"
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">{v.emoji}</span>
                  <h3 className="text-2xl font-bold">{v.title}</h3>
                </div>
                <p className="text-gray-400 mb-4">{v.description}</p>
                <div className="flex flex-wrap gap-2">
                  {v.features.map((f) => (
                    <span
                      key={f}
                      className={`px-3 py-1 rounded-full text-sm bg-gradient-to-r ${v.color} text-white`}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Brain View Teaser */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-3xl p-8 md:p-12 border border-gray-700">
            <div className="md:flex items-center gap-8">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h2 className="text-3xl font-bold mb-4">
                  See the <span className="text-orange-500">Brain</span> at work
                </h2>
                <p className="text-gray-400 mb-4">
                  Most AI apps show a chat bubble and a spinner. Molt-OS shows you everything.
                </p>
                <ul className="space-y-2 text-gray-300">
                  <li>✓ Watch your AI &quot;think&quot; in real-time</li>
                  <li>✓ See tool calls as they happen</li>
                  <li>✓ Understand what your AI is doing and why</li>
                </ul>
              </div>
              <div className="md:w-1/2">
                <div className="bg-black/50 rounded-xl p-4 border border-gray-600">
                  <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center text-gray-500">
                    [ Brain Visualizer Preview ]
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-gray-400 mb-12">No hidden fees. No surprise bills.</p>
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8">
            <div className="text-5xl font-bold mb-2">
              $50<span className="text-xl text-gray-400">/month</span>
            </div>
            <p className="text-gray-400 mb-6">+ AI usage (pay what you use)</p>
            <ul className="text-left max-w-sm mx-auto space-y-3 mb-8">
              <li className="flex items-center gap-3">
                <span className="text-green-500">✓</span> Your own dedicated AI instance
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-500">✓</span> Access to all models (GPT-5, Claude, etc.)
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-500">✓</span> Unlimited integrations
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-500">✓</span> The Brain visualizer
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-500">✓</span> Priority support
              </li>
            </ul>
            <a
              href="#waitlist"
              className="inline-block bg-orange-500 hover:bg-orange-600 px-8 py-4 rounded-xl text-lg font-semibold transition"
            >
              Join the Waitlist
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="font-semibold mb-2">What AI models can I use?</h3>
              <p className="text-gray-400">
                All of them. GPT-5, Claude Opus, Gemini, Llama, and more. We handle the API keys—you just chat.
              </p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="font-semibold mb-2">Is my data private?</h3>
              <p className="text-gray-400">
                Yes. Each user gets their own isolated AI instance. Your conversations never mix with anyone else&apos;s.
              </p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="font-semibold mb-2">How does usage billing work?</h3>
              <p className="text-gray-400">
                You pay the actual cost of AI tokens + a small convenience fee. No markups on the base subscription.
              </p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="font-semibold mb-2">Can I connect it to my tools?</h3>
              <p className="text-gray-400">
                Absolutely. Gmail, Calendar, GitHub, Notion, Slack—we have integrations for all the major tools. Install them with one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist CTA */}
      <section id="waitlist" className="py-20 px-6 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to meet your AI?</h2>
          <p className="text-gray-400 mb-8">
            Join the waitlist for early access. Be the first to experience Molt-OS.
          </p>
          {submitted ? (
            <div className="bg-green-500/20 border border-green-500 rounded-xl p-6">
              <p className="text-green-400 font-semibold">🎉 You&apos;re on the list!</p>
              <p className="text-gray-400 text-sm mt-2">We&apos;ll reach out when it&apos;s your turn.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="flex-1 px-4 py-4 rounded-xl bg-gray-800 border border-gray-700 focus:border-orange-500 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 px-8 py-4 rounded-xl font-semibold transition whitespace-nowrap"
              >
                Get Early Access
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-500">
            © 2026 Molt-OS. Built by <span className="text-orange-500">R2</span> & <span className="text-orange-500">Clawd 🦞</span>
          </div>
          <div className="flex gap-6 text-gray-500">
            <a href="#" className="hover:text-white transition">Twitter</a>
            <a href="#" className="hover:text-white transition">Discord</a>
            <a href="#" className="hover:text-white transition">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
