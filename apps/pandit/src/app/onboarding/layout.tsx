export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="screen-always-on min-h-screen bg-vedic-cream">
      {children}
    </div>
  )
}