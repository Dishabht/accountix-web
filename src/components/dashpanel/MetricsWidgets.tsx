import DefaultCardComponent from './DefaultCardComponent';
import LazyWrapper from './LazyWrapper';
import StatCard from './StatCard';
import type { DashpanelCardData } from './types';

interface MetricsWidgetsProps {
  cardsData: DashpanelCardData[];
  title?: string;
  useCardWrapper?: boolean;
  gridClassName?: string;
}

const getAdaptiveGridClassName = (count: number) => {
  if (count <= 1) return 'grid grid-cols-1 gap-6';
  if (count === 2) return 'grid grid-cols-1 md:grid-cols-2 gap-6';
  if (count === 3) return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
  if (count === 4) return 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6';
  return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-6';
};

const MetricsWidgets = ({
  cardsData,
  title = 'Metrics',
  useCardWrapper = false,
  gridClassName,
}: MetricsWidgetsProps) => {
  const resolvedGridClassName = gridClassName || getAdaptiveGridClassName(cardsData.length);

  const content = (
    <div className={resolvedGridClassName}>
      <LazyWrapper>
        <StatCard cardsData={cardsData} />
      </LazyWrapper>
    </div>
  );

  if (!useCardWrapper) return content;

  return <DefaultCardComponent title={title}>{content}</DefaultCardComponent>;
};

export default MetricsWidgets;
