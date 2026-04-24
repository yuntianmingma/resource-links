import { useMemo } from 'react';
import linksData from '../data/links.json';
import categoriesData from '../config/categories.json';
import type { Link, Category } from '../types';

const links = linksData as Link[];
const categories = categoriesData as Category[];

export function useLinks() {
  return useMemo(() => ({ links, categories }), []);
}

export type { Link, Category };
