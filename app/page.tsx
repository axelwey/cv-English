"use client";

import styles from "./page.module.css";
import { useLanguage } from "./context/LanguageContext";

export default function Home() {
  const { language } = useLanguage();

  const content = {
    nl: {
      profiel: "Profiel",
      profielText:
        "Gemotiveerde bachelorstudent Elektronica-ICT (IT, Cybersecurity & Cloud) met een brede technische basis en sterke interesse in moderne IT-oplossingen.",
      kennis: "Kennis",
      kennisText:
        "Sterke basis in softwareontwikkeling, webtechnologieën en backend-ontwikkeling, aangevuld met kennis van automatisatie, CI/CD, virtualisatie en fundamentele cybersecurity-principes.",
      ervaring: "Ervaring",
      ervaringText:
        "Praktijkervaring opgebouwd binnen de opleiding via labo’s en opdrachten waarin softwareontwikkeling, cloud- en securityconcepten gecombineerd werden.",
      ambitie: "Ambitie",
      ambitieText:
        "Technische kennis verder verdiepen en uitgroeien tot een sterke IT-professional in cloud en cybersecurity.",
    },
    en: {
      profiel: "Profile",
      profielText:
        "Motivated Bachelor's student in Electronics-ICT (IT, Cybersecurity & Cloud) with a broad technical foundation and a strong interest in modern IT solutions.",
      kennis: "Knowledge",
      kennisText:
        "Strong foundation in software development, web technologies and backend development, complemented by knowledge of automation, CI/CD, virtualization and fundamental cybersecurity principles.",
      ervaring: "Experience",
      ervaringText:
        "Practical experience gained through labs and projects combining software development, cloud technologies and security concepts.",
      ambitie: "Ambition",
      ambitieText:
        "To further deepen technical expertise and grow into a strong IT professional specializing in cloud and cybersecurity.",
    },
  };

  const t = content[language];

  return (
    <main className={styles.home}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Axel Weyers</h1>
      </section>

      <section className={styles.grid}>
        <article className={styles.card}>
          <h2>{t.profiel}</h2>
          <p>{t.profielText}</p>
        </article>

        <article className={styles.card}>
          <h2>{t.kennis}</h2>
          <p>{t.kennisText}</p>
        </article>

        <article className={styles.card}>
          <h2>{t.ervaring}</h2>
          <p>{t.ervaringText}</p>
        </article>

        <article className={styles.card}>
          <h2>{t.ambitie}</h2>
          <p>{t.ambitieText}</p>
        </article>
      </section>
    </main>
  );
}
