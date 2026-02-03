import ReferralLanding from '@/components/referrals/ReferralLanding';

export default function ReferralPage() {
  // Cookie is set by middleware
  // Show generic landing page without referrer name
  // (Avoids needing anonymous database access)
  return <ReferralLanding referrerName="a colleague" />;
}
