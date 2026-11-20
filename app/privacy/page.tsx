import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: November 14, 2026</p>

      <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-foreground/90">
        <section>
          <h2 className="text-lg font-semibold">What we collect</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>
              Your <strong>Google account name, email address, and profile photo</strong>, used to
              create your account when you sign in with Google.
            </li>
            <li>
              Your <strong>study activity</strong>: best quiz scores and questions you have marked
              as known. This powers your progress sync across devices.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">How we use it</h2>
          <p className="mt-3">
            Your data is used only to operate this study site: keeping you signed in and saving
            your progress across devices. We never sell or share your personal information.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Third-party services</h2>
          <p className="mt-3">
            Sign-in is handled by Google. Data is stored on Neon (managed Postgres database
            hosting). Neither service receives more data than described above.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Deleting your data</h2>
          <p className="mt-3">
            You can sign out at any time. To delete your account and all associated progress, sign
            in and use the account menu, or contact us.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Contact</h2>
          <p className="mt-3">
            Questions about this policy? Reach out at{' '}
            <a className="underline underline-offset-2" href="mailto:wyatt@wyattprice.dev">
              wyatt@wyattprice.dev
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
