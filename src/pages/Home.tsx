import { Link, useNavigate } from 'react-router-dom'
import { Button } from 'fancy-ui-react'
import { PAGES, SECTIONS, pagesIn } from '../lib/content'
import { MotionReveal, useMotion } from '../lib/motion'
import { usePageMeta } from '../lib/usePageMeta'

const base = import.meta.env.BASE_URL

/** One line of a shell session: a prompt, a command, and the answer. */
function Line({ cmd, children }: { cmd: string; children: React.ReactNode }) {
  return (
    <div className="mt-2">
      <span className="term-prompt text-pulse">{cmd}</span>
      <div className="mt-1 pl-4 text-muted">{children}</div>
    </div>
  )
}

export function Home() {
  usePageMeta(
    undefined,
    'A shell for the lab: what runs, where to start, and what each part costs — read in one typeface.',
  )
  const navigate = useNavigate()
  const { mode } = useMotion()
  const full = mode === 'full'

  const guides = pagesIn('guides').filter((p) => p.order >= 10)
  const isotopes = pagesIn('isotopes').filter((p) => p.slug !== 'what-is-an-isotope')
  const facts = [
    { k: 'pages', v: PAGES.length },
    { k: 'sections', v: SECTIONS.length },
    { k: 'runtime', v: 'none' },
  ]

  return (
    <>
      {/* The front door is a session, not a brochure: three commands that answer
          the only questions a newcomer has before touching anything. */}
      <section className="relative overflow-hidden border-b border-line/70">
        <div className="plot-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <MotionReveal preset="fade-up">
              <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1 text-xs tracking-wide text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-pulse" />
                le.gume-shell · orient first
              </p>
            </MotionReveal>

            <MotionReveal preset="fade-up" delay={60}>
              <h1 className="mt-6 text-3xl leading-[1.1] font-semibold tracking-tight text-cream sm:text-5xl">
                The lab, from a
                <br />
                <span className="text-pulse">shell prompt</span>.
              </h1>
            </MotionReveal>

            <MotionReveal preset="fade-up" delay={120}>
              <p className="mt-5 max-w-xl text-base leading-7 text-muted">
                Small services talking JSON-RPC: an alarm that watches, a dashboard that
                answers, a proxy that routes, and a tick they all agree on. This site is
                what to read before you touch any of it.
              </p>
            </MotionReveal>

            <MotionReveal preset="fade-up" delay={180}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {full ? (
                  <Button href={`${base}guides/find-the-alarm`} variant="primary">
                    Find the alarm
                  </Button>
                ) : (
                  <Button href={`${base}guides/find-the-alarm`} variant="primary">
                    Find the alarm
                  </Button>
                )}
                <Button variant="secondary" onClick={() => navigate('/guides/price-a-rotation')}>
                  Price a rotation
                </Button>
              </div>
            </MotionReveal>

            <div className="mt-9 flex flex-wrap gap-x-8 gap-y-3 text-xs tracking-wide text-muted">
              {facts.map((f) => (
                <div key={f.k}>
                  <div className="text-cream">{f.v}</div>
                  <div>{f.k}</div>
                </div>
              ))}
            </div>
          </div>

          <MotionReveal preset="fade-up" delay={140}>
            <div className="term-frame" data-host="lab — ~/">
              <div className="px-4 py-3 text-sm leading-6">
                <Line cmd="ls ~/lab">
                  <span className="term-path">alarm/</span> <span className="term-path">dashboard/</span>{' '}
                  <span className="term-path">proxy/</span> <span className="term-path">tick/</span>
                  <span className="term-dim"> — four things, one clock</span>
                </Line>
                <hr className="term-rule my-3" />
                <Line cmd="alarm status">
                  <span className="text-pulse">peer</span> healthy · handshake initialize, tools/list
                  <br />
                  <span className="text-muted">one probe cannot tell a restart from a rotation</span>
                </Line>
                <hr className="term-rule my-3" />
                <Line cmd="rate_limit --core">
                  <span className="text-cream">4900 / 5000</span>{' '}
                  <span className="term-dim">reset in 466s — cache, do not re-ask</span>
                </Line>
                <hr className="term-rule my-3" />
                <Line cmd="tick --peer">
                  <span className="text-cream">358957238</span>{' '}
                  <span className="term-dim">offset +0 · in phase</span>
                  <span className="term-caret">▌</span>
                </Line>
              </div>
            </div>
          </MotionReveal>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
        <h2 className="text-lg font-semibold tracking-tight text-cream">Start with a task</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Each of these has a beginning and an end, and none of them assumes you have read
          anything else on this site.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {guides.map((g) => (
            <Link
              key={g.path}
              to={`/${g.section}/${g.slug}`}
              className="hairline group rounded-lg bg-surface/60 p-5 transition-colors hover:border-pulse/60"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-base font-semibold text-cream group-hover:text-pulse">{g.title}</h3>
                <span className="term-dim text-xs">guide</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted">{g.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-14 sm:px-8">
        <h2 className="text-lg font-semibold tracking-tight text-cream">Lift something small</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Isotopes are minimal systems with a stated cost and a stated failure. Named after
          pickles, because the name is the URL and the prompt.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {isotopes.slice(0, 6).map((i) => (
            <Link
              key={i.path}
              to={`/${i.section}/${i.slug}`}
              className="hairline group rounded-lg bg-surface/60 p-5 transition-colors hover:border-pulse/60"
            >
              <h3 className="text-base font-semibold text-cream group-hover:text-pulse">{i.slug}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{i.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8">
        <div className="hairline rounded-lg bg-surface/40 p-6">
          <h2 className="text-base font-semibold text-cream">What this site is not</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            Not a deployment guide for a fleet, and not a vendor page. It is a seed: the
            content is Markdown, the navigation is derived from the files, and the same
            guard that refuses a broken link here will refuse it in your copy. Copy it,
            do not integrate it.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link className="text-pulse hover:underline" to="/docs/quickstart">
              take the starter →
            </Link>
            <Link className="text-pulse hover:underline" to="/docs/for-agents">
              the agent contract →
            </Link>
            <Link className="text-pulse hover:underline" to="/seeds/lab-operator">
              who this is for →
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
