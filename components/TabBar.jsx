'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  {
    href: '/activities',
    label: 'Activities',
    icon: <path d="M12 3l2.2 5.6L20 9.5l-4.4 3.9 1.3 5.8L12 16.3l-4.9 2.9 1.3-5.8L4 9.5l5.8-.9z" />,
  },
  {
    href: '/syncs',
    label: 'Syncs',
    icon: (
      <>
        <circle cx="9" cy="12" r="6" />
        <circle cx="15" cy="12" r="6" />
      </>
    ),
  },
  {
    href: '/me',
    label: 'Profile',
    icon: (
      <>
        <circle cx="12" cy="9" r="4" />
        <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
      </>
    ),
  },
]

export default function TabBar() {
  const path = usePathname()

  return (
    <nav className="tabbar">
      {TABS.map(({ href, label, icon }) => (
        <Link key={href} href={href} className={path.startsWith(href) ? 'on' : ''}>
          <svg viewBox="0 0 24 24" aria-hidden>
            {icon}
          </svg>
          {label}
        </Link>
      ))}
    </nav>
  )
}
