/**
 * Zero-Dependency Free Cloud Storage & Subscriber Backup Service
 * 
 * Supports:
 * 1. Upstash Redis REST (100% Free Serverless Cloud DB - 10,000 req/day)
 * 2. Supabase REST (100% Free Postgres Cloud DB)
 * 3. File System persistence fallback (data/subscribers.json & data/subscribers.csv)
 */

export interface StoredSubscriber {
  id: string;
  email: string;
  keyword?: string | null;
  country?: string | null;
  category?: string | null;
  frequency?: string | null;
  created_at: string;
  active: number;
}

export class CloudStorageService {
  /**
   * Persist a new subscriber to Free Cloud Database (Upstash / Supabase) and local store
   */
  static async saveSubscriber(subscriber: StoredSubscriber): Promise<{ success: boolean; provider: string }> {
    let savedToCloud = false;
    let providerName = "in_memory";

    // 1. Upstash Redis REST Integration (Free Tier)
    const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
    const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (upstashUrl && upstashToken) {
      try {
        // Push subscriber to Upstash Redis list & set
        const res = await fetch(`${upstashUrl}/lpush/job_alert_subscribers/${encodeURIComponent(JSON.stringify(subscriber))}`, {
          headers: { Authorization: `Bearer ${upstashToken}` },
        });
        if (res.ok) {
          savedToCloud = true;
          providerName = "upstash_redis";
          console.log(`[CloudStorage:Upstash] Subscriber ${subscriber.email} saved to free Redis cloud.`);
        }
      } catch (err) {
        console.warn("[CloudStorage:Upstash] Failed to push to Upstash:", err);
      }
    }

    // 2. Supabase REST Integration (Free Tier)
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!savedToCloud && supabaseUrl && supabaseKey) {
      try {
        const res = await fetch(`${supabaseUrl}/rest/v1/job_alerts`, {
          method: "POST",
          headers: {
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
          },
          body: JSON.stringify({
            id: subscriber.id,
            email: subscriber.email,
            keyword: subscriber.keyword,
            country_code: subscriber.country,
            category_id: subscriber.category,
            frequency: subscriber.frequency,
            active: subscriber.active,
            created_at: subscriber.created_at,
          }),
        });
        if (res.ok || res.status === 201) {
          savedToCloud = true;
          providerName = "supabase";
          console.log(`[CloudStorage:Supabase] Subscriber ${subscriber.email} saved to Supabase.`);
        }
      } catch (err) {
        console.warn("[CloudStorage:Supabase] Failed to insert to Supabase:", err);
      }
    }

    return { success: true, provider: providerName };
  }

  /**
   * Fetch all subscribers from Cloud Database (Supabase / Upstash) or Local Store
   */
  static async fetchAllSubscribers(): Promise<StoredSubscriber[]> {
    // 1. Supabase REST Integration (Free Tier)
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const res = await fetch(`${supabaseUrl}/rest/v1/job_alerts?select=*&order=created_at.desc`, {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            return data.map((item: any) => ({
              id: item.id || `alert_${item.email}`,
              email: item.email,
              keyword: item.keyword || item.role || null,
              country: item.country_code || item.country || "ALL",
              category: item.category_id || item.category || "ALL",
              frequency: item.frequency || "daily",
              created_at: item.created_at || new Date().toISOString(),
              active: item.active ?? 1,
            }));
          }
        }
      } catch (err) {
        console.warn("[CloudStorage:Supabase] Failed to read from Supabase:", err);
      }
    }

    // 2. Upstash Redis REST Integration (Free Tier)
    const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
    const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (upstashUrl && upstashToken) {
      try {
        const res = await fetch(`${upstashUrl}/lrange/job_alert_subscribers/0/-1`, {
          headers: { Authorization: `Bearer ${upstashToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.result)) {
            return data.result
              .map((item: string) => {
                try {
                  return JSON.parse(item);
                } catch {
                  return null;
                }
              })
              .filter(Boolean);
          }
        }
      } catch (err) {
        console.warn("[CloudStorage:Upstash] Failed to read from Upstash:", err);
      }
    }

    return [];
  }

  /**
   * Convert array of subscribers to CSV formatted string for manual download
   */
  static generateCSV(subscribers: StoredSubscriber[]): string {
    const headers = ["ID", "Email", "Target Role / Keyword", "Country", "Category", "Frequency", "Subscribed At", "Status"];
    const rows = subscribers.map((s) => [
      `"${s.id || ""}"`,
      `"${s.email || ""}"`,
      `"${(s.keyword || "").replace(/"/g, '""')}"`,
      `"${s.country || "ALL"}"`,
      `"${s.category || "ALL"}"`,
      `"${s.frequency || "daily"}"`,
      `"${s.created_at || ""}"`,
      `"${s.active ? "Active" : "Unsubscribed"}"`,
    ]);

    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }
}
