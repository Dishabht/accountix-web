import type { ReactNode } from 'react';

interface DefaultCardComponentProps {
  title: string;
  children: ReactNode;
}

const DefaultCardComponent = ({ title, children }: DefaultCardComponentProps) => {
  return (
    <section className="card h-full !block overflow-hidden border-0 !p-0">
      <header className="!block border-b border-neutral-200 !py-4 px-6">
        <h3 className="text-lg font-semibold capitalize">{title}</h3>
      </header>
      <div className="card-body p-6">{children}</div>
    </section>
  );
};

export default DefaultCardComponent;
