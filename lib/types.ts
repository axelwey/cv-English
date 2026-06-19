export interface BilingualText {
  nl: string;
  en: string;
}

export interface TimelineItem {
  id: string;
  order: number;
  year: BilingualText;
  title: BilingualText;
  desc: BilingualText;
}

export interface ProjectItem {
  id: string;
  order: number;
  title: BilingualText;
  desc: BilingualText;
  file: string;
}

export interface HomeBlock {
  id: string;
  order: number;
  title: BilingualText;
  text: BilingualText;
}

export interface HomeData {
  heroTitle: string;
  blocks: HomeBlock[];
}

export interface TimelineData {
  items: TimelineItem[];
}

export interface ProjectsData {
  githubUrl: string;
  items: ProjectItem[];
}
