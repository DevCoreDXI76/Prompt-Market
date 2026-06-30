import type { PromptProduct } from "./promptData";
import { PROMPT_PRODUCTS } from "./promptData";
import { buildSeedProducts } from "../scripts/seed-data";

interface PromptTranslation {
  titleEn: string;
  descriptionEn: string;
}

let translationByTitle: Map<string, PromptTranslation> | null = null;

function getTranslationByTitle(): Map<string, PromptTranslation> {
  if (!translationByTitle) {
    translationByTitle = new Map();

    for (const product of buildSeedProducts()) {
      if (product.titleEn && product.descriptionEn) {
        translationByTitle.set(product.title, {
          titleEn: product.titleEn,
          descriptionEn: product.descriptionEn,
        });
      }
    }

    for (const product of PROMPT_PRODUCTS) {
      if (product.titleEn && product.descriptionEn) {
        translationByTitle.set(product.title, {
          titleEn: product.titleEn,
          descriptionEn: product.descriptionEn,
        });
      }
    }
  }

  return translationByTitle;
}

function resolveEnglishFields(product: PromptProduct): PromptTranslation | null {
  const staticRef = PROMPT_PRODUCTS.find((p) => p.id === product.id);
  const titleLookup = getTranslationByTitle().get(product.title);

  const titleEn = product.titleEn ?? staticRef?.titleEn ?? titleLookup?.titleEn;
  const descriptionEn =
    product.descriptionEn ?? staticRef?.descriptionEn ?? titleLookup?.descriptionEn;

  if (!titleEn) {
    return null;
  }

  return {
    titleEn,
    descriptionEn: descriptionEn ?? titleEn,
  };
}

export function getLocalizedTitle(title: string, locale: string): string {
  if (locale !== "en") {
    return title;
  }

  const translation = getTranslationByTitle().get(title);
  return translation?.titleEn ?? title;
}

export function getLocalizedProduct(product: PromptProduct, locale: string): PromptProduct {
  if (locale !== "en") {
    return product;
  }

  const english = resolveEnglishFields(product);
  if (!english) {
    return product;
  }

  return {
    ...product,
    title: english.titleEn,
    description: english.descriptionEn,
  };
}

export function getLocalizedProducts(
  products: PromptProduct[],
  locale: string
): PromptProduct[] {
  return products.map((product) => getLocalizedProduct(product, locale));
}
