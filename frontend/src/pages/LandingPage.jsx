import { Link } from 'react-router-dom'
import './LandingPage.css'

const FEATURES = [
    {
        icon: '⚡',
        title: 'Premium Technical Content',
        desc: 'System design deep-dives, AI tutorials, interview prep — hand-crafted by elite engineers.',
    },
    {
        icon: '🔐',
        title: 'Gated Subscription Tiers',
        desc: 'Creators set flexible monthly tiers. Subscribers unlock exclusive posts, files, and resources.',
    },
    {
        icon: '💳',
        title: 'Stripe-Powered Payments',
        desc: 'Recurring subscriptions handled securely. Creators earn every month, automatically.',
    },
    {
        icon: '☁️',
        title: 'Secure File Storage',
        desc: 'Code samples, PDFs, and project files stored on AWS S3 with time-limited presigned URLs.',
    },
    {
        icon: '🏆',
        title: 'Creator Economy',
        desc: '85% revenue goes directly to creators. Build your audience and monetize your expertise.',
    },
    {
        icon: '🛡️',
        title: 'Enterprise Security',
        desc: 'JWT auth, role-based access control, HTTPS-only. Your content and payments stay safe.',
    },
]

const STATS = [
    { value: '10K+', label: 'Developers' },
    { value: '500+', label: 'Creators' },
    { value: '$2M+', label: 'Paid Out' },
    { value: '85%', label: 'Revenue Share' },
]

const TIERS_EXAMPLE = [
    {
        name: 'Starter',
        price: '$9',
        perks: ['Weekly blog posts', 'Code snippets', 'Community access'],
        popular: false,
    },
    {
        name: 'Pro',
        price: '$29',
        perks: ['Everything in Starter', 'System design PDFs', 'Video walkthroughs', 'Q&A sessions'],
        popular: true,
    },
    {
        name: 'Elite',
        price: '$79',
        perks: ['Everything in Pro', '1-on-1 code reviews', 'Interview mock sessions', 'Private Discord'],
        popular: false,
    },
]

function LandingPage() {
    return (
        <main className="landing">

            {/* ── Hero ─────────────────────────────────────────────── */}
            <section className="hero">
                <div className="hero__glow" />
                <div className="container hero__content">
                    <div className="badge badge-brand hero__badge">
                        🚀 The Developer Creator Platform
                    </div>

                    <h1 className="hero__title">
                        Monetize Your{' '}
                        <span className="gradient-text">Engineering</span>
                        {' '}Expertise
                    </h1>

                    <p className="hero__subtitle">
                        DevElite Hub connects elite developers with learners who want premium,
                        curated technical content. Build sustainable income from system design,
                        AI engineering, and interview prep.
                    </p>

                    <div className="hero__actions">
                        <Link to="/register?role=CREATOR" className="btn btn-primary btn-xl">
                            Start Creating →
                        </Link>
                        <Link to="/register?role=SUBSCRIBER" className="btn btn-secondary btn-xl">
                            Explore Creators
                        </Link>
                    </div>

                    <div className="hero__stats">
                        {STATS.map((s) => (
                            <div key={s.label} className="hero__stat">
                                <span className="hero__stat-value gradient-text">{s.value}</span>
                                <span className="hero__stat-label">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Decorative code block */}
                <div className="container">
                    <div className="hero__code-window">
                        <div className="hero__code-topbar">
                            <span className="dot red" />
                            <span className="dot yellow" />
                            <span className="dot green" />
                            <span className="hero__code-file">creator-api.java</span>
                        </div>
                        <pre className="hero__code-body">
                            <code>{`@RestController
@RequestMapping("/api/creators")
public class CreatorController {

  @PostMapping("/posts")
  @PreAuthorize("hasRole('CREATOR')")
  public ResponseEntity<ApiResponse<PostDto>> createPost(
    @Valid @RequestBody CreatePostRequest req) {
    
    return ResponseEntity.status(201)
      .body(ApiResponse.created(
        postService.createPost(req),
        "Post published successfully ✓"
      ));
  }
}`}</code>
                        </pre>
                    </div>
                </div>
            </section>

            {/* ── Features ─────────────────────────────────────────── */}
            <section className="section features" id="features">
                <div className="container">
                    <div className="section-header">
                        <div className="badge badge-brand">Platform Features</div>
                        <h2>Built for the <span className="gradient-text">Developer Economy</span></h2>
                        <p>Everything creators and subscribers need — nothing they don&apos;t.</p>
                    </div>

                    <div className="grid grid-3 gap-6 features__grid">
                        {FEATURES.map((f) => (
                            <div key={f.title} className="card feature-card">
                                <span className="feature-card__icon">{f.icon}</span>
                                <h4 className="feature-card__title">{f.title}</h4>
                                <p className="feature-card__desc">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Pricing ──────────────────────────────────────────── */}
            <section className="section pricing" id="pricing">
                <div className="container">
                    <div className="section-header">
                        <div className="badge badge-brand">Subscription Tiers</div>
                        <h2>Example Creator <span className="gradient-text">Pricing</span></h2>
                        <p>Creators set their own tiers. This is an example layout.</p>
                    </div>

                    <div className="pricing__grid">
                        {TIERS_EXAMPLE.map((tier) => (
                            <div
                                key={tier.name}
                                className={`card pricing-card ${tier.popular ? 'pricing-card--popular' : ''}`}
                            >
                                {tier.popular && (
                                    <div className="pricing-card__popular-badge">Most Popular</div>
                                )}
                                <h3 className="pricing-card__name">{tier.name}</h3>
                                <div className="pricing-card__price">
                                    <span>{tier.price}</span>
                                    <small>/month</small>
                                </div>
                                <ul className="pricing-card__perks">
                                    {tier.perks.map((p) => (
                                        <li key={p}>
                                            <span className="perk-check">✓</span> {p}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    to="/register?role=SUBSCRIBER"
                                    className={`btn w-full ${tier.popular ? 'btn-primary' : 'btn-secondary'}`}
                                >
                                    Subscribe
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ──────────────────────────────────────────────── */}
            <section className="section cta-section">
                <div className="container">
                    <div className="cta-card">
                        <h2>Ready to Share Your <span className="gradient-text">Expertise?</span></h2>
                        <p>
                            Join hundreds of engineers already earning from their knowledge.
                            Set up your creator profile in minutes.
                        </p>
                        <div className="cta-card__actions">
                            <Link to="/register?role=CREATOR" className="btn btn-primary btn-xl">
                                Become a Creator
                            </Link>
                            <Link to="/register?role=SUBSCRIBER" className="btn btn-ghost btn-xl">
                                I want to learn →
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Footer ───────────────────────────────────────────── */}
            <footer className="footer">
                <div className="container footer__inner">
                    <div className="navbar__logo">
                        <span className="navbar__logo-icon">⚡</span>
                        <span className="navbar__logo-text">
                            DevElite<span className="gradient-text">Hub</span>
                        </span>
                    </div>
                    <p className="footer__copy">
                        © 2026 DevElite Hub. Built for developers, by developers.
                    </p>
                    <div className="footer__links">
                        <a href="#">Privacy</a>
                        <a href="#">Terms</a>
                        <a href="#">Contact</a>
                    </div>
                </div>
            </footer>
        </main>
    )
}

export default LandingPage
