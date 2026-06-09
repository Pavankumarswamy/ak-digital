import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Services } from "@/components/site/Services";
import { About } from "@/components/site/About";
import { Blogs } from "@/components/site/Blogs";
import { Testimonials } from "@/components/site/Testimonials";
import { FAQ } from "@/components/site/FAQ";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { FloatingActions } from "@/components/site/FloatingActions";
import { LoadingScreen } from "@/components/site/LoadingScreen";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AK DIGITAL HUB — Connecting You To The World" },
      {
        name: "description",
        content:
          "Trusted digital service partner for PAN Card, GST Registration, Voter ID, Employment Services, and more. Fast, reliable, affordable.",
      },
      { property: "og:title", content: "AK DIGITAL HUB — Digital Services" },
      {
        property: "og:description",
        content:
          "Premium online service center — PAN, GST, Voter ID, Employment & more.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main>
      <Hero />
      <Services />
      <About />
      <Blogs />
      <Testimonials />
      <FAQ />
      <Contact />
    </main>
  );
}
