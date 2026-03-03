export default function BillingCancelPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center px-6 py-12">
      <div className="panel w-full p-8 text-center">
        <h1 className="text-2xl font-bold">Checkout canceled</h1>
        <p className="mt-2 text-slate-600">No changes were made to your subscription.</p>
        <a href="/" className="mt-5 inline-block rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white">
          Return to dashboard
        </a>
      </div>
    </main>
  );
}
