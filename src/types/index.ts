import { cleanupAppFeatures } from "@/constants";

export type Page = {
  [K in keyof typeof cleanupAppFeatures]: K;
}[keyof typeof cleanupAppFeatures];

export type BlocklistData = {
  coin: any[];
  object: any[];
  domain: any[];
  package: any[];
  totalRecords: number;
};

export type BlocklistApiType = "basic" | "deep" | "malware" | "phishing";
export type BlocklistType = "coin" | "object" | "domain" | "package";
