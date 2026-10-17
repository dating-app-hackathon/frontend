// The real app, after onboarding: every page here gets the bottom tab bar.
import TabBar from '@/components/TabBar'
import './app.css'

export default function AppLayout({ children }) {
  return (
    <>
      {children}
      <TabBar />
    </>
  )
}
