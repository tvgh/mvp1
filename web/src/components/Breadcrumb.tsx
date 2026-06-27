import { Fragment } from 'react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1 text-sm text-on-surface-variant"
    >
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <Fragment key={`${item.label}-${idx}`}>
            {item.to && !isLast ? (
              <Link to={item.to} className="hover:text-primary hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'font-medium text-on-surface' : ''}>
                {item.label}
              </span>
            )}
            {!isLast && (
              <span
                className="material-symbols-outlined text-[16px] text-on-surface-variant/70"
                aria-hidden="true"
              >
                chevron_right
              </span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
