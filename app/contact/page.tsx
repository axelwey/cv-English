"use client";

import styles from "./contact.module.css";
import { useLanguage } from "../context/LanguageContext";

export default function ContactPage() {
  const { language } = useLanguage();

  const content = {
    nl: {
      title: "Contact",
      description: "Je kan me bereiken via onderstaande kanalen.",
    },
    en: {
      title: "Contact",
      description: "You can reach me through the channels below.",
    },
  };

  const t = content[language];

  return (
    <main className={styles.contact}>
      <section className={styles.card}>
        <h1>{t.title}</h1>
        <p>{t.description}</p>

        <ul className={styles.links}>
          <li>
            <span>E-mail</span>
            <a href="mailto:axelweyers@gmail.com">
              axelweyers@gmail.com
            </a>
          </li>
          <li>
            <span>LinkedIn</span>
            <a
              href="https://www.linkedin.com/in/axel-weyers-4243b0365"
              target="_blank"
              rel="noopener noreferrer"
            >
              linkedin.com/in/axel-weyers
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}
