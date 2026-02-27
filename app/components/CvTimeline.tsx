"use client";

import { useLanguage } from "../context/LanguageContext";

export default function CvTimeline() {
  const { language } = useLanguage();

  const content = {
    nl: {
      intro: "Bachelor Elektronica-ICT (IT, Cybersecurity & Cloud) met focus op infrastructuur, DevOps en security.",
      skills: "Skills",
      skillsText: (
        <>
          • Linux fundamentals: permissions, services & troubleshooting <br />
          • Networking: VLANs, routing, firewalls, segmentation <br />
          • CI/CD & containers: Docker, pipelines, automation basics <br />
          • Cybersecurity: hardening, logging/monitoring, fundamentals
        </>
      ),
      projects: "Projecten",
      project1: "• SD-WAN → Full SASE — migratie naar een volledige SASE-architectuur.",
      project2: "• Startup → Full Cloud (virtueel) — cloud-native infrastructuur voor een fictieve startupomgeving.",
      nextStep: "Volgende stap",
      nextStepText: "Op zoek naar groei in cloud & cybersecurity via projecten, samenwerking en echte use-cases.",
    },
    en: {
      intro: "Bachelor Electronics-ICT (IT, Cybersecurity & Cloud) focusing on infrastructure, DevOps, and security.",
      skills: "Skills",
      skillsText: (
        <>
          • Linux fundamentals: permissions, services & troubleshooting <br />
          • Networking: VLANs, routing, firewalls, segmentation <br />
          • CI/CD & containers: Docker, pipelines, automation basics <br />
          • Cybersecurity: hardening, logging/monitoring, fundamentals
        </>
      ),
      projects: "Projects",
      project1: "• SD-WAN → Full SASE — migration to a full SASE architecture.",
      project2: "• Startup → Full Cloud (virtual) — cloud-native infrastructure for a fictional startup environment.",
      nextStep: "Next step",
      nextStepText: "Looking for growth in cloud & cybersecurity through projects, collaboration, and real-world use cases.",
    }
  };

  const t = content[language];

  return (
    <div className="cv">
      {/* 1) HERO */}
      <section id="cv-1" className="cv-section cv-top-left">
        <h2 className="sticky-title">Axel Weyers</h2>
        <p>{t.intro}</p>
        <p style={{ marginTop: 10, opacity: 0.75 }}>
          Cloud • Networking • Linux • Security
        </p>
      </section>

      {/* 2) SKILLS */}
      <section id="cv-2" className="cv-section cv-top-right">
        <h2 className="sticky-title">{t.skills}</h2>
        <p>{t.skillsText}</p>
      </section>

      {/* 3) PROJECTS */}
      <section id="cv-3" className="cv-section cv-bottom-left">
        <h2 className="sticky-title">{t.projects}</h2>
        <p>
          {t.project1}
          <br />
          {t.project2}
        </p>
      </section>

      {/* 4) NEXT STEP */}
      <section id="cv-4" className="cv-section cv-bottom-right">
        <h2 className="sticky-title">{t.nextStep}</h2>
        <p>{t.nextStepText}</p>
      </section>
    </div>
  );
}
