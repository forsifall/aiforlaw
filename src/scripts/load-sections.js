async function loadInto(selector, url) {
    const el = document.querySelector(selector);
    if (!el) return;
    const html = await fetch(url).then((r) => r.text());
    el.innerHTML = html;
  }

  loadInto('#header', 'sections/header.html');
  loadInto('#hero-section', 'sections/hero.html');
  loadInto('#why-ai-section', 'sections/why-ai.html');
  loadInto('#business-problems-section', 'sections/business-problems.html');
  loadInto('#neural-risks-section', 'sections/neural-risks.html');
  loadInto('#ai-implement-section', 'sections/ai-implement.html');
  loadInto('#ai-how-section', 'sections/ai-how.html');
  loadInto('#market-transform-section', 'sections/market-transform.html');
  loadInto('#ai-pilot-section', 'sections/ai-pilot.html');
  loadInto('#ai-productivity-section', 'sections/ai-productivity.html');
  loadInto('#ai-payback-section', 'sections/ai-payback.html');
  loadInto('#ai-can-do-section', 'sections/ai-can-do.html');
  loadInto('#ai-security-section', 'sections/ai-security.html');
  loadInto('#impl-stages-section', 'sections/impl-stages.html');
  loadInto('#pricing-section', 'sections/pricing.html');
  loadInto('#cta-consult-section', 'sections/cta-consult.html');
  loadInto('#limited-deploy-section', 'sections/limited-deploy.html');
  loadInto('#ai-foundation-section', 'sections/ai-foundation.html');
  loadInto('#compare-free-ai-section', 'sections/compare-free-ai.html');
  loadInto('#ai-tech-advantages-section', 'sections/ai-tech-advantages.html');
  loadInto('#client-reviews-section', 'sections/client-reviews.html');
  loadInto('#solo-lawyer-cta-section', 'sections/solo-lawyer-cta.html');
  loadInto('#release-roadmap-section', 'sections/release-roadmap.html');
  loadInto('#prosto-chel-cta-section', 'sections/prosto-chel-cta.html');
  loadInto('#site-footer-section', 'sections/footer.html');