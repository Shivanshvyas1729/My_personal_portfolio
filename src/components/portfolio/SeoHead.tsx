import { portfolioData } from "@/data/portfolioData";

const SeoHead = () => {
  const { name, title } = portfolioData.personal;
  return null; // SEO is handled via index.html
};

export default SeoHead;
