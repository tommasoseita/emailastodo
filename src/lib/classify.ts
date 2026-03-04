import { Email, SplitCategory } from '@/types/email';

const NOTIFICATION_DOMAINS = [
  'github.com', 'gitlab.com', 'bitbucket.org',
  'jira.atlassian.com', 'atlassian.net', 'atlassian.com',
  'slack.com', 'notion.so', 'linear.app',
  'trello.com', 'asana.com', 'monday.com',
  'figma.com', 'vercel.com', 'netlify.com',
  'stripe.com', 'paypal.com',
  'aws.amazon.com', 'cloud.google.com',
  'docker.com', 'sentry.io',
  'linkedin.com', 'twitter.com', 'x.com',
  'facebook.com', 'instagram.com',
  'youtube.com', 'spotify.com',
  'uber.com', 'lyft.com',
  'doordash.com', 'grubhub.com',
];

const NEWSLETTER_PATTERNS = [
  'noreply', 'no-reply', 'newsletter', 'news@', 'digest',
  'updates@', 'marketing@', 'info@', 'hello@', 'team@',
  'notification', 'announce', 'bulletin', 'weekly', 'daily',
  'subscriptions', 'mailer-daemon',
];

export function classifyEmail(email: Email): SplitCategory {
  const fromLower = email.fromEmail.toLowerCase();
  const headers = email.labels;

  // Check if it's a newsletter
  const isNewsletter =
    NEWSLETTER_PATTERNS.some((p) => fromLower.includes(p)) ||
    headers.includes('CATEGORY_PROMOTIONS') ||
    headers.includes('CATEGORY_UPDATES');

  if (isNewsletter) return 'newsletters';

  // Check if it's a notification from known services
  const isNotification =
    NOTIFICATION_DOMAINS.some((d) => fromLower.includes(d)) ||
    headers.includes('CATEGORY_SOCIAL') ||
    headers.includes('CATEGORY_FORUMS');

  if (isNotification) return 'notifications';

  // Check if it's important (personal email, direct reply)
  const isImportant =
    headers.includes('IMPORTANT') ||
    headers.includes('CATEGORY_PERSONAL') ||
    (!fromLower.includes('noreply') && !fromLower.includes('no-reply'));

  if (isImportant) return 'important';

  return 'other';
}

export function classifyEmails(emails: Email[]): Record<SplitCategory, Email[]> {
  const result: Record<SplitCategory, Email[]> = {
    important: [],
    notifications: [],
    newsletters: [],
    other: [],
  };

  for (const email of emails) {
    const category = classifyEmail(email);
    result[category].push(email);
  }

  return result;
}
