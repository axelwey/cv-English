"use client";

import styles from "./over.module.css";
import { useLanguage } from "../context/LanguageContext";
import timelineData from "../../data/timeline.json";
import projectsData from "../../data/projects.json";

export default function OverPage() {
  const { language } = useLanguage();

  const timeline = [...timelineData.items].sort((a, b) => a.order - b.order);
  const projects = [...projectsData.items].sort((a, b) => a.order - b.order);

  const labels = {
    nl: { title: "Over mij", projectsTitle: "Projecten", githubBtn: "Bekijk mijn GitHub-profiel", pdfBtn: "Bekijk PDF" },
    en: { title: "About me", projectsTitle: "Projects", githubBtn: "View my GitHub profile", pdfBtn: "View PDF" }
  };

  const t = labels[language];

  return (
    <main className={styles.over}>
      <section className={styles.timelineSection}>
        <h1 className={styles.title}>{t.title}</h1>
        <div className={styles.timeline}>
          {timeline.map((item) => (
            <div key={item.id} className={styles.item}>
              <span className={styles.year}>{item.year[language]}</span>
              <div className={styles.content}>
                <h3>{item.title[language]}</h3>
                {item.desc[language] && <p>{item.desc[language]}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.projectsSection}>
        <h2 className={styles.subtitle}>{t.projectsTitle}</h2>
        <div className={styles.projects}>
          {projects.map((project) => (
            <div key={project.id} className={styles.projectCard}>
              <h3>{project.title[language]}</h3>
              <p>{project.desc[language]}</p>
              {project.file && (
                <a href={`/projects/${project.file}`} target="_blank" rel="noopener noreferrer">
                  {t.pdfBtn}
                </a>
              )}
            </div>
          ))}
        </div>
        <div className={styles.github}>
          <a href={projectsData.githubUrl} target="_blank" rel="noopener noreferrer">
            {t.githubBtn}
          </a>
        </div>
      </section>
    </main>
  );
}
