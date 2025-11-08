"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { BLOCKLIST_URLS, cleanupAppFeatures } from "@/constants";
import { BlocklistApiType, BlocklistData, BlocklistType } from "@/types";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const parseBlocklist = (data: any) => {
  if (data && data.blocklist && Array.isArray(data.blocklist)) {
    // console.log(
    //   `✅ ${type} blocklist 載入成功: ${data.blocklist.length} 筆記錄`
    // );
    return data.blocklist;
  } else if (Array.isArray(data)) {
    // console.log(
    //   `✅ ${type} blocklist 載入成功 (直接陣列): ${data.length} 筆記錄`
    // );
    return data;
  } else {
    // console.warn(`⚠️ ${type} blocklist 格式錯誤或為空，資料:`, data);
    return [];
  }
};

export default function Blocklist() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [blocklists, setBlocklists] = useState<BlocklistData | null>(null);
  const [searchResult, setSearchResult] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);

  const isAddressBlacklisted = (address: string, type: string) => {
    if (!blocklists) return false;

    const blocklist = blocklists[type as keyof BlocklistData] || [];

    if (!Array.isArray(blocklist) || blocklist.length === 0) {
      // console.warn(`⚠️ ${type} blocklist is empty or not loaded`);
      return false;
    }

    // console.log(
    //   `🔍 檢查 ${address} 是否在 ${type} 黑名單中 (${blocklist.length} 筆記錄)`
    // );

    const normalizedAddress = address.toLowerCase().trim();

    return blocklist.some((item) => {
      // 處理字串格式
      if (typeof item === "string") {
        const normalizedItem = item.toLowerCase().trim();

        let match = false;

        if (type === "domain") {
          // 域名精確匹配
          match = normalizedItem === normalizedAddress;
        } else if (type === "package") {
          // Package ID 匹配 - 支援精確匹配和從完整地址提取 package ID
          const packageIdFromAddress = normalizedAddress.split("::")[0];
          match =
            normalizedItem === normalizedAddress ||
            normalizedItem === packageIdFromAddress;
        } else if (type === "coin" || type === "object") {
          // Coin 和 Object 使用部分匹配 (檢查 package ID 部分)
          // 格式: 0x...::module::TYPE
          // 我們提取 0x... 部分進行匹配
          const packageIdFromItem = normalizedItem.split("::")[0];
          const packageIdFromAddress = normalizedAddress.split("::")[0];

          // 支援完整匹配或 package ID 匹配
          match =
            normalizedItem === normalizedAddress ||
            packageIdFromItem === normalizedAddress ||
            packageIdFromAddress === normalizedItem ||
            normalizedItem.includes(normalizedAddress) ||
            normalizedAddress.includes(packageIdFromItem);
        }

        // if (match) {
        //   console.log(`🎯 找到匹配項 (${type}): ${item} matches ${address}`);
        // }
        return match;
      }

      // 處理物件格式 (可能包含額外資訊)
      if (typeof item === "object" && item !== null) {
        // 支援多種可能的屬性名稱
        const addressFields = [
          "address",
          "id",
          "domain",
          "package_id",
          "coin_type",
          "value",
        ];
        for (const field of addressFields) {
          if (item[field]) {
            const normalizedFieldValue = item[field].toLowerCase().trim();
            let match = false;

            if (type === "domain") {
              match = normalizedFieldValue === normalizedAddress;
            } else if (type === "package") {
              const packageIdFromAddress = normalizedAddress.split("::")[0];
              match =
                normalizedFieldValue === normalizedAddress ||
                normalizedFieldValue === packageIdFromAddress;
            } else if (type === "coin" || type === "object") {
              const packageIdFromField = normalizedFieldValue.split("::")[0];
              const packageIdFromAddress = normalizedAddress.split("::")[0];

              match =
                normalizedFieldValue === normalizedAddress ||
                packageIdFromField === normalizedAddress ||
                packageIdFromAddress === normalizedFieldValue ||
                normalizedFieldValue.includes(normalizedAddress) ||
                normalizedAddress.includes(packageIdFromField);
            }

            if (match) {
              // console.log(
              //   `🎯 找到匹配項 (物件.${field}): ${item[field]} matches ${address}`
              // );
              return true;
            }
          }
        }
      }

      return false;
    });
  };

  const handleSearchClick = async () => {
    const addressInput = (
      document.getElementById("addressInput") as HTMLTextAreaElement
    ).value.trim();
    const addressType = (
      document.getElementById("addressType") as HTMLSelectElement
    ).value as BlocklistApiType;

    if (!addressInput) {
      setSearchResult("❌ Enter valid address");
      return;
    }

    if (!addressType) {
      setSearchResult("❌ Please select address type");
      return;
    }

    // 檢查黑名單是否已載入
    if (!blocklists || blocklists.totalRecords === 0) {
      setSearchResult(
        "❌ Blocklist not loaded or failed to load, please restart the extension"
      );
      return;
    }

    setIsSearching(true);
    setSearchResult("");

    try {
      // prepare addresses list
      const addresses = addressInput
        .split("\n")
        .map((addr) => addr.trim())
        .filter((addr) => addr);

      const invalid = addresses.some((addr) => {
        if (!addr) return true;
        // treat inputs wrapped in /.../ as regex (skip 0x check)
        if (addr.startsWith("/") && addr.endsWith("/")) return false;
        // allow module-qualified forms like 0x..::module::Type, but still require 0x prefix
        if (addr.includes("::")) return addr.trim().startsWith("0x");
        // otherwise require 0x prefix
        return !addr.trim().startsWith("0x");
      });

      if (invalid) {
        setIsSearching(false);
        setSearchResult("❌ Please enter valid addresses (must start with 0x)");
        return;
      }

      const results = [];

      for (const address of addresses) {
        const typeMap: { [key in BlocklistApiType]: BlocklistType } = {
          basic: "coin",
          deep: "object",
          malware: "domain",
          phishing: "package",
        };

        const blocklistType = typeMap[addressType];
        const isBlacklisted = isAddressBlacklisted(address, blocklistType);

        results.push({
          address,
          isBlacklisted,
          type: blocklistType,
        });

        // console.log(
        //   `🔍 檢測地址: ${address} (${blocklistType}) -> ${isBlacklisted ? "❌ 黑名單" : "✅ 安全"}`
        // );
      }

      // 顯示結果
      const blacklistedCount = results.filter((r) => r.isBlacklisted).length;
      const safeCount = results.length - blacklistedCount;

      let resultText = "";

      if (blacklistedCount > 0) {
        resultText += `⚠️ Found ${blacklistedCount} addresses in blocklists!\n\n`;
        results
          .filter((r) => r.isBlacklisted)
          .forEach((r) => {
            resultText += `❌ ${r.address} (${r.type})\n`;
          });

        if (safeCount > 0) {
          resultText += `\n✅ ${safeCount} addresses are safe\n`;
          results
            .filter((r) => !r.isBlacklisted)
            .forEach((r) => {
              resultText += `✅ ${r.address}\n`;
            });
        }
      } else {
        resultText = `✅ All ${results.length} addresses are safe!\n\n`;
        results.forEach((r) => {
          resultText += `✅ ${r.address}\n`;
        });
      }

      setSearchResult(resultText);
    } catch (error) {
      console.error("❌ 檢測過程錯誤:", error);
      setSearchResult("❌ An error occurred during the search");
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    async function fetchBlocklists() {
      setLoading(true);

      try {
        const [coinRaw, objectRaw, domainRaw, pkgRaw] = await Promise.all([
          fetch(BLOCKLIST_URLS.coin).then((r) => r.json()),
          fetch(BLOCKLIST_URLS.object).then((r) => r.json()),
          fetch(BLOCKLIST_URLS.domain).then((r) => r.json()),
          fetch(BLOCKLIST_URLS.package).then((r) => r.json()),
        ]);
        const coin = parseBlocklist(coinRaw);
        const object = parseBlocklist(objectRaw);
        const domain = parseBlocklist(domainRaw);
        const pkg = parseBlocklist(pkgRaw);

        setBlocklists({
          coin,
          object,
          domain,
          package: pkg,
          totalRecords:
            coin.length + object.length + domain.length + pkg.length,
        });
      } catch (e) {
        console.log(e);
        setBlocklists({
          coin: [],
          object: [],
          domain: [],
          package: [],
          totalRecords: 0,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchBlocklists();
  }, []);

  if (loading) {
    return <LoadingSpinner size={60} />;
  }

  return (
    <div className="flex h-screen flex-col p-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/sui-wallet-cleanup-app")}
          className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-gray-100"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
        </button>
        {/* <div className="flex items-center gap-2">
          <CheckCircleIcon className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium text-green-600">Protected</span>
        </div> */}
      </div>
      <hr className="mb-6 border-t border-gray-100" />
      <div className="flex-1 overflow-y-auto">
        {/* <div className="mb-4 text-center">
          <h2 className="text-xl font-bold text-gray-900">
            {cleanupAppFeatures.blocklist}
          </h2>
        </div> */}

        <div className="flex-1 overflow-y-auto">
          <div className="mb-4 text-center">
            <h2 className="text-xl font-bold text-gray-900">
              {cleanupAppFeatures.blocklist}
            </h2>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="addressType"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Address Type
                </label>
                <select
                  id="addressType"
                  className="w-full rounded-lg border border-gray-200 p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Choose type...</option>
                  <option value="basic">Coin Address</option>
                  <option value="deep">Object ID</option>
                  <option value="malware">Domain</option>
                  <option value="phishing">Package ID</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="addressInput"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Enter address
                </label>
                <textarea
                  id="addressInput"
                  placeholder="0x0000000000000000000000000000000000000000000000000000000000000000"
                  maxLength={200}
                  rows={2}
                  className="w-full resize-none rounded-lg border border-gray-200 p-3 font-mono text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Blocklist successfully loaded, total records:{" "}
                  {!!blocklists?.totalRecords ? blocklists.totalRecords : 0}
                </p>
              </div>
              <button
                className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-3 font-medium text-white transition-all hover:from-blue-600 hover:to-blue-700 disabled:opacity-50"
                onClick={handleSearchClick}
                disabled={isSearching}
              >
                {isSearching ? "Searching..." : "🔍 Search Blocklists"}
              </button>
            </div>

            {/* 檢測結果區域 */}
            {searchResult && (
              <div className="mt-4 rounded-xl border-2 bg-gray-50 p-4">
                <h3 className="mb-2 font-medium text-gray-800">
                  Search Result:
                </h3>
                <pre
                  className="overflow-auto font-mono text-sm break-words whitespace-pre-wrap text-gray-700"
                  style={{ maxHeight: 240, wordBreak: "break-all" }}
                >
                  {searchResult}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
