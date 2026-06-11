// Types partagés des contenus rédactionnels de la section Ressources.
//
// Principes éditoriaux (SEO + GEO) appliqués à chaque contenu :
// - l'intro répond directement à la question de la page (featured snippet) ;
// - des H2 explicites, souvent formulés comme des questions ;
// - des listes et tableaux facilement citables par les moteurs génératifs ;
// - des ordres de grandeur prudents plutôt que des chiffres inventés ;
// - une FAQ courte qui couvre les requêtes associées.

export type ContentSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  table?: { caption: string; headers: string[]; rows: string[][] };
};

export type ResourceFaqItem = { q: string; a: string };

export type ResourceContent = {
  intro: string;
  sections: ContentSection[];
  faq?: ResourceFaqItem[];
};
