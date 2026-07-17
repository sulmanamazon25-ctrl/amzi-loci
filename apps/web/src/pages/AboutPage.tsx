import { PageMeta } from "../components/layout/PageMeta";
import { Hero } from "../components/marketing/Hero";

export function AboutPage() {
  return (
    <>
      <PageMeta
        title="About"
        description="Amzi Loci helps Amazon sellers and agencies turn customer reviews into complete listing assets — local-first, BYOK, built for production workflows."
        path="/about"
      />
      <Hero title="About Amzi Loci" subtitle="Built for people who ship listings, not slide decks." />

      <section className="container-page prose-page pb-20">
        <p>
          Amzi Loci started from a simple observation: the best Amazon listings come from what
          buyers actually say in reviews — but turning that into copy, images, and Seller Central
          uploads still takes hours across too many tools.
        </p>
        <h2>Our approach</h2>
        <p>
          We built a local-first Windows desktop app with a guided six-step workflow. Your API keys
          stay yours. Your project data stays on your machine. The server handles licensing and
          proxies AI with proprietary prompts — nothing more.
        </p>
        <h2>Who it's for</h2>
        <ul>
          <li>Amazon freelancers and VAs delivering listing refreshes</li>
          <li>Micro-agencies managing multiple client SKUs</li>
          <li>Solo FBA sellers who want structure without another SaaS black box</li>
        </ul>
        <h2>Who it's not for</h2>
        <ul>
          <li>Beginners who want one-click autopilot without API setup</li>
          <li>Teams needing keyword research, PPC, and inventory in one tool</li>
          <li>Enterprise brands with legal review and DAM workflows</li>
        </ul>
      </section>
    </>
  );
}
