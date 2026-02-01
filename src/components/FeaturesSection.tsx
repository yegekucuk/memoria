import { Timer, BarChart2, Tag, Shield } from 'lucide-react';

export const FeaturesSection = () => {
  const features = [
    {
      icon: <Timer className="w-8 h-8 text-primary" />,
      title: "Smart Session Tracking",
      description: "Real-time, distraction-free timer with one-click start and detailed history logging."
    },
    {
      icon: <BarChart2 className="w-8 h-8 text-purple-600" />,
      title: "Deep Analytics",
      description: "Visual activity charts and key metrics to benchmark focus consistency and productivity."
    },
    {
      icon: <Tag className="w-8 h-8 text-blue-500" />,
      title: "Custom Organization",
      description: "Create colorful custom tags and add specific notes to every session."
    },
    {
      icon: <Shield className="w-8 h-8 text-emerald-500" />,
      title: "Secure & Private",
      description: "Robust authentication system ensuring your data stays private and secure."
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-purple-900 mb-8">
          Features
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="p-6 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2"
          >
            <div className="mb-4 p-3 bg-white dark:bg-white/10 rounded-xl w-fit shadow-xs">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
