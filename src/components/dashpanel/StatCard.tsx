import type { DashpanelCardData } from './types';

interface StatCardProps {
  cardsData: DashpanelCardData[];
}

const StatCard = ({ cardsData }: StatCardProps) => {
  return (
    <>
      {cardsData.map((card, index) => (
        <div
          key={`${card.title}-${index}`}
          className={`bg-gradient-to-r ${card.gradientFrom} to-white p-0 border border-gray-200 rounded-md shadow-none`}
        >
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">{card.title}</p>
                <h3 className="mt-1 text-2xl font-bold text-neutral-900">{card.value}</h3>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${card.iconBg}`}>
                <card.icon className="text-white" size={24} />
              </div>
            </div>

            {(card.growth && card.growthIcon && card.growthColor) || card.description ? (
              <div className="mt-4 flex items-center gap-2 text-sm">
                {card.growth && card.growthIcon && card.growthColor && (
                  <span className={`flex items-center gap-1 ${card.growthColor}`}>
                    <card.growthIcon fill="currentColor" stroke="none" width={14} height={14} />
                    {card.growth}
                  </span>
                )}
                {card.description && <span className="text-[13px] text-neutral-500">{card.description}</span>}
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </>
  );
};

export default StatCard;
