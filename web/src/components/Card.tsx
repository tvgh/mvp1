import type { ReactNode } from 'react';

export function Card({
  title,
  right,
  children,
}: {
  title: ReactNode;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="card rounded-xl border flex flex-col">
      <header className="flex items-center justify-between border-b border-outline-variant px-md py-sm">
        <h3 className="font-label-md text-label-md text-on-surface uppercase">{title}</h3>
        {right && <div className="text-primary-container">{right}</div>}
      </header>
      <div className="p-md">{children}</div>
    </section>
  );
}
