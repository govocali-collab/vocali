import OnboardingForm from "./OnboardingForm"

interface Props {
  searchParams: Promise<{
    clinicName?: string
    firstName?: string
    lastName?: string
    email?: string
  }>
}

export default async function OnboardingPage({ searchParams }: Props) {
  const prefill = await searchParams
  return <OnboardingForm prefill={prefill} />
}
