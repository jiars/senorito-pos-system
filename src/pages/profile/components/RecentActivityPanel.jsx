import { Card } from '@/components/ui/card';
import { formatDateTime } from '@/utils/shared/formatters/dateFormatters';

const RecentActivityPanel = ({ profile, lastActivityAt }) => {
    let activityTitle = 'Last System Update';
    let activityIcon = 'bi-boxes';

    if (profile.role.role_name === 'Cashier') {
        activityTitle = 'Last Order Processed';
        activityIcon = 'bi-receipt';
    } else if (profile.role.role_name === 'Inventory Clerk') {
        activityTitle = 'Last Inventory Update';
    }

    const activities = [
        { title: 'Last Login', date: profile.last_login_at, icon: 'bi-box-arrow-in-right' },
        { title: activityTitle, date: lastActivityAt, icon: activityIcon },
    ];

    return (
        <Card
            role="region"
            aria-labelledby="profile-activity-heading"
            className="min-w-0 gap-[var(--app-gap-section)] rounded-[var(--app-radius-panel-standard)] bg-[var(--app-color-surface)] p-[var(--app-padding-panel)] shadow-none ring-0"
        >
            <header>
                <h2 id="profile-activity-heading" className="m-0 text-[length:var(--app-font-size-h3)] font-bold leading-[var(--app-line-height-h3)] text-[var(--app-color-brand-header)]">Recent Activity</h2>
                <p className="m-0 mt-[var(--app-space-1)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text-muted)]">Your latest recorded account activity.</p>
            </header>
            <ul className="m-0 grid min-w-0 list-none gap-[var(--app-gap-related)] p-0 sm:grid-cols-2">
                {activities.map((activity) => (
                    <li key={activity.title} className="flex min-w-0 items-start gap-[var(--app-space-4)] rounded-[var(--app-radius-nested)] bg-[var(--app-color-canvas)] p-[var(--app-space-4)]">
                        <i aria-hidden="true" className={`bi ${activity.icon} shrink-0 text-[length:var(--app-font-size-h3)] text-[var(--app-color-brand)]`} />
                        <div className="min-w-0">
                            <p className="m-0 text-[length:var(--app-font-size-body-secondary)] font-medium leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)]">{activity.title}</p>
                            <p className={`m-0 mt-[var(--app-space-2)] text-[length:var(--app-font-size-body)] leading-[var(--app-line-height-body)] [overflow-wrap:anywhere] ${activity.date ? "font-semibold text-[var(--app-color-text)]" : "font-normal text-[var(--app-color-text-muted)]"}`}>{activity.date ? formatDateTime(activity.date) : 'No activity yet'}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </Card>
    );
};

export default RecentActivityPanel;
