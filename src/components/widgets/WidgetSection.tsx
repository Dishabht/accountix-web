import React from 'react';

interface WidgetSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const WidgetSection: React.FC<WidgetSectionProps> = ({ title, children, className = '' }) => {
  return (
    <section className={`card h-full overflow-hidden border-0 bg-white ${className}`}>
      <header className="border-b border-slate-200 px-6 py-4 dark:border-slate-600">
        <h3 className="text-lg font-semibold capitalize text-slate-900">{title}</h3>
      </header>
      <div className="card-body p-6">{children}</div>
    </section>
  );
};

export default WidgetSection;
