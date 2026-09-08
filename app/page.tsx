import RedisData from "./components/redisData";

export default async function Home() {


  const data = await RedisData();
  
  
  
  return (
    <div>
      <div
      className="flex justify-center"
      dangerouslySetInnerHTML={{ __html: data ?? "" }}
    />
    </div>
  );
}
