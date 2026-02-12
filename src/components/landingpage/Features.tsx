import React from 'react';
import { Timer, BarChart2, Tag, Shield } from 'lucide-react';
import { SectionTitle } from './SectionTitle';
import { FeatureItem } from './FeatureItem';

export const Features = () => {
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
    <div className="w-full max-w-4xl mx-auto px-4">
      <SectionTitle 
        title="Features" 
        className="bg-clip-text text-transparent bg-linear-to-r from-primary to-purple-900"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <FeatureItem
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </div>
  );
};
