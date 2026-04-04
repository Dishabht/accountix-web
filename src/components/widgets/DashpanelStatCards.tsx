import React from 'react';

type DashpanelStatCardItem = {
  title: string;
  value: string;
  icon: React.ElementType;
  iconBg: string;
  gradientFrom: string;
  growth: string;
  growthIcon: React.ElementType;
  growthColor: string;
  description: string;
};

interface DashpanelStatCardsProps {
  items: DashpanelStatCardItem[];
  className?: string;
}

const DashpanelStatCards: React.FC<DashpanelStatCardsProps> = ({ items, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 ${className}`}>
      {items.map((card, index) => (
        <div
          key={`${card.title}-${index}`}
          className={`bg-gradient-to-r ${card.gradientFrom} to-white dark:to-slate-700 p-0 border border-gray-200 dark:border-slate-700 rounded-md shadow-none`}
        >
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">{card.title}</p>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{card.value}</h3>
              </div>
              <div className={`w-12 h-12 ${card.iconBg} rounded-full flex items-center justify-center`}>
                <card.icon className="text-white" size={24} />
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm mt-4">
              <span className={`flex items-center gap-1 ${card.growthColor}`}>
                <card.growthIcon fill="currentColor" stroke="none" width={14} height={14} />
                {card.growth}
              </span>
              <span className="text-neutral-500 dark:text-neutral-400 text-[13px]">{card.description}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashpanelStatCards;