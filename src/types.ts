/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Variant {
  s: string; // storage capacity, e.g. "4GB / 64GB" or "256GB"
  name: string; // full English name
  bc?: string; // barcode
  id?: string | number; // database variant ID (mostly for iOS)
  name_en?: string;
  name_ar?: string;
}

export interface ColorDetail {
  img: string;
  variants: Variant[];
}

export type FamilyCatalog = Record<string, ColorDetail>;

export interface TreeItem {
  active?: boolean;
  children?: Record<string, { active: boolean }>;
}

export interface QueueItem {
  family: string;
  brand: string;
  color: string;
  storage: string;
  name: string;
  img: string;
  barcode: string;
  sku: string;
  country: string;
  warranty: string;
  name_ar?: string;
  desc?: string;
  desc_ar?: string;
  hl?: string;
  hl_ar?: string;
  sim?: string;
  region?: string;
  facetime?: string;
  isIOS?: boolean;
}

export interface Submission {
  id: number;
  shop_name: string;
  name_en: string;
  brand: string;
  model_family: string;
  country: string;
  warranty: string;
  barcode?: string;
  seller_sku?: string;
  created_at?: string;
  batch_id?: string;
  is_ios?: boolean;
  name_ar?: string;
  desc_en?: string;
  desc_ar?: string;
  highlights_en?: string;
  highlights_ar?: string;
  color?: string;
  image1?: string;
}

export interface SelectedStorageState {
  sim: string;
  facetime: string;
  region: string;
  country: string;
  warranty: string;
  barcode: string;
  sku: string;
}
