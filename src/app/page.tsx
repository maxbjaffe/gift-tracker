// Root page - shows different content based on app mode
import { isGiftStashApp } from '@/lib/app-config'
import { GiftStashLanding } from '@/components/landing/GiftStashLanding'
import { FamilyHubHome } from '@/components/landing/FamilyHubHome'

export default function HomePage() {
  // Show GiftStash landing page for giftstash.app
  // Show Family Hub homepage for family hub deployment
  if (isGiftStashApp()) {
    return <GiftStashLanding />
  }

  return <FamilyHubHome />
}
