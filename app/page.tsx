"use client";

import styles from "./page.module.css";
import { useLanguage } from "./context/LanguageContext";
import homeData from "../data/home.json";

export default function Home() {
  const { language } = useLanguage();

  const blocks = [...homeData.blocks].sort((a, b) => a.order - b.order);

  return (
    <main className={styles.home}>
      <section className={styles.hero}>
        <h1 className={styles.title}>{homeData.heroTitle}</h1>
      </section>

      <section className={styles.grid}>
        {blocks.map((block) => (
          <article key={block.id} className={styles.card}>
            <h2>{block.title[language]}</h2>
            <p>{block.text[language]}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
