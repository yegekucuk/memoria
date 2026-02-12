import React from 'react';
import { UserPlus, Clock, BarChart3 } from 'lucide-react';
import { SectionTitle } from './SectionTitle';
import { StepItem } from './StepItem';

export const HowItWorks = () => {
  const steps = [
    {
      title: "1. Create Account & Start Timer",
      description: "Sign up in seconds and start your first focus session with a single click. No complex setup required.",
      videoPlaceholder: "Step 1 Video",
      icon: <UserPlus className="w-6 h-6 text-primary" />
    },
    {
      title: "2. Tag & Add Notes",
      description: "Categorize your sessions with custom tags and add notes to keep track of what you accomplished.",
      videoPlaceholder: "Step 2 Video",
      icon: <Clock className="w-6 h-6 text-secondary" />
    },
    {
      title: "3. Analyze Progress",
      description: "Visualize your productivity habits with detailed weekly and monthly analytics graphs.",
      videoPlaceholder: "Step 3 Video",
      icon: <BarChart3 className="w-6 h-6 text-purple-500" />
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <SectionTitle 
        title="How it works"
        description="Simple, powerful, and effective. Here is how you can boost your productivity in 3 steps."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {steps.map((step, index) => (
          <StepItem
            key={index}
            title={step.title}
            description={step.description}
            videoPlaceholder={step.videoPlaceholder}
            icon={step.icon}
          />
        ))}
      </div>
    </div>
  );
};
