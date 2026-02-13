export default function BookingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold">Booking #{params.id}</h1>
      <p className="mt-2 text-gray-600">View your booking details, status, and payment information.</p>
    </main>
  );
}
