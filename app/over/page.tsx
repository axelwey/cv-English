"use client";

import styles from "./over.module.css";
import { useLanguage } from "../context/LanguageContext";

export default function OverPage() {
  const { language } = useLanguage();

  const content = {
    nl: {
      title: "Over mij",
      projectsTitle: "Projecten",
      githubBtn: "Bekijk mijn GitHub-profiel",
      pdfBtn: "Bekijk PDF",
      timeline: [
        { year: "2006", title: "Geboren", desc: "" },
        { year: "2021 – 2024", title: "Studie Elektriciteit – Elektronica", desc: "Middelbaar onderwijs met focus op technische basis en praktijk." },
        { year: "2021 – 2025", title: "Assistent Tuinonderhoud — Project T²", desc: "Terugkerende zomerjob binnen tuin- en onderhoudswerken." },
        { year: "Zomer 2021", title: "Ijsschepper — Ijsbieke", desc: "Weekend- en seizoenswerk met focus op klantenservice en tempo." },
        { year: "Zomer 2022", title: "Productie Operator — Kemin Industries", desc: "Werken in een industriële productieomgeving met procesgerichte taken." },
        { year: "Zomer 2023", title: "Assistent Airco-installatie — Maes Industries", desc: "Ondersteuning bij installaties in een technische werkomgeving." },
        { year: "Zomer 2024", title: "Inpakker & Administratie — Biscuiterie Thijs", desc: "Combinatie van uitvoerend werk en administratieve ondersteuning." },
        { year: "2024 – heden", title: "Studie IT & Cloud & Cybersecurity", desc: "Opleiding met focus op infrastructuur, cloud, DevOps en cybersecurity." },
        { year: "Sep 2024 – heden", title: "Keukenmedewerker — Link21", desc: "Werken in professionele keukenomgeving in combinatie met studies." },
        { year: "Zomer 2025", title: "Podiumbouwer — 360 EVENTS", desc: "Opbouw en afbraak van podiumstructuren op grootschalige evenementen (Tomorrowland, Gentse Feesten, Dominator). Verplicht behalen van VCA VOL-certificaat." }
      ],
      projectData: [
        { title: "SD-WAN naar Full SASE", desc: "Technisch ontwerpproject rond de migratie van een klassiek SD-WAN-netwerk naar een volledige SASE-architectuur.", link: "/projects/sdwan-sase.pdf" },
        { title: "Startup naar Full Cloud (virtueel)", desc: "Virtueel project waarbij een cloud-native infrastructuur werd ontworpen voor een fictieve startupomgeving.", link: "/projects/startup-cloud.pdf" }
      ]
    },
    en: {
      title: "About me",
      projectsTitle: "Projects",
      githubBtn: "View my GitHub profile",
      pdfBtn: "View PDF",
      timeline: [
        { year: "2006", title: "Born", desc: "" },
        { year: "2021 – 2024", title: "Study Electricity – Electronics", desc: "Secondary education focused on technical basics and practice." },
        { year: "2021 – 2025", title: "Garden Maintenance Assistant — Project T²", desc: "Recurring summer job in garden and maintenance work." },
        { year: "Summer 2021", title: "Ice Cream Server — Ijsbieke", desc: "Weekend and seasonal work focused on customer service and pace." },
        { year: "Summer 2022", title: "Production Operator — Kemin Industries", desc: "Working in an industrial production environment with process-oriented tasks." },
        { year: "Summer 2023", title: "Air Conditioning Installation Assistant — Maes Industries", desc: "Support with installations in a technical work environment." },
        { year: "Summer 2024", title: "Packer & Administration — Biscuiterie Thijs", desc: "Combination of operational work and administrative support." },
        { year: "2024 – present", title: "Study IT & Cloud & Cybersecurity", desc: "Education focusing on infrastructure, cloud, DevOps, and cybersecurity." },
        { year: "Sep 2024 – present", title: "Kitchen Assistant — Link21", desc: "Working in a professional kitchen environment combined with studies." },
        { year: "Summer 2025", title: "Stage Builder — 360 EVENTS", desc: "Assembly and disassembly of stage structures at large-scale events (Tomorrowland, Gentse Feesten, Dominator). Mandatory VCA VOL certificate." }
      ],
      projectData: [
        { title: "SD-WAN to Full SASE", desc: "Technical design project regarding the migration from a traditional SD-WAN network to a full SASE architecture.", link: "/projects/sdwan-sase.pdf" },
        { title: "Startup to Full Cloud (virtual)", desc: "Virtual project designing a cloud-native infrastructure for a fictional startup environment.", link: "/projects/startup-cloud.pdf" }
      ]
    }
  };

  const t = content[language];

  return (
    <main className={styles.over}>
      <section className={styles.timelineSection}>
        <h1 className={styles.title}>{t.title}</h1>
        <div className={styles.timeline}>
          {t.timeline.map((item, i) => (
            <div key={i} className={styles.item}>
              <span className={styles.year}>{item.year}</span>
              <div className={styles.content}>
                <h3>{item.title}</h3>
                {item.desc && <p>{item.desc}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.projectsSection}>
        <h2 className={styles.subtitle}>{t.projectsTitle}</h2>
        <div className={styles.projects}>
          {t.projectData.map((project, i) => (
            <div key={i} className={styles.projectCard}>
              <h3>{project.title}</h3>
              <p>{project.desc}</p>
              <a href={project.link} target="_blank" rel="noopener noreferrer">
                {t.pdfBtn}
              </a>
            </div>
          ))}
        </div>
        <div className={styles.github}>
          <a href="https://github.com/axelwey" target="_blank" rel="noopener noreferrer">
            {t.githubBtn}
          </a>
        </div>
      </section>
    </main>
  );
}
