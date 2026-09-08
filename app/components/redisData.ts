import { Redis } from "@upstash/redis";

export default async function RedisData() {
  const redis = new Redis({
    url: process.env["UPSTASH_REDIS_REST_URL"],
    token: process.env["UPSTASH_REDIS_REST_TOKEN"],
  });

  const data = await redis.get<string>("foo");
  console.log(data);

  return data;
}
