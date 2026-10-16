import { Link } from 'react-router';

// The site used to be one long page with #section links; those sections now have their own pages.
// Old links (saved in announcements, update posts or content) keep working through this map.
const PAGES = { '#top': '/', '#shop': '/shop', '#updates': '/updates', '#process': '/how-to-order', '#story': '/about', '#reviews': '/about', '#faq': '/faq', '#join': '/faq' };

export const toPath = (href = '') => PAGES[href] ?? href;

// A link that stays inside the site for pages, and opens other sites in a new tab.
export default function SmartLink({ href, children, ...props }) {
  const to = toPath(href);
  if (to.startsWith('/')) {
    return (
      <Link to={to} {...props}>
        {children}
      </Link>
    );
  }
  const external = /^https?:/i.test(to);
  return (
    <a href={to} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...props}>
      {children}
    </a>
  );
}
