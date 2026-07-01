import type { Metadata } from "next";
import ContactForm from "../components/pages/ContactForm";
import { Slide } from "../animation/Slide";

export const metadata: Metadata = {
  title: "Contact | Ayush Kumar",
  description:
    "Contact Ayush Kumar for collaborations, internships, projects, or a quick hello.",
};

export default function Contact() {
  return (
    <main className="relative mx-auto max-w-7xl overflow-visible px-6 md:-mt-14 md:px-16">
      <Slide>
        <ContactForm />
      </Slide>
    </main>
  );
}
