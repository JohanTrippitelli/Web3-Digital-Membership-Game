const redis = require("redis");
const { promisify } = require("util");

// Singleton Redis client instance
let redisClient;

function createRedisClient() {
  console.log("Creating Redis client...");
  if (!redisClient) {
    // Create the Redis client only if it doesn't exist
    redisClient = redis.createClient({
      host: "localhost", // Redis server address
      port: 6379, // Redis server port
      // Add any additional configuration options here if needed
    });

    // Promisify Redis commands for easier use with async/await
    redisClient.getAsync = promisify(redisClient.get).bind(redisClient);
    redisClient.setAsync = promisify(redisClient.set).bind(redisClient);
    redisClient.delAsync = promisify(redisClient.del).bind(redisClient);

    console.log("Redis client created.");
  } else {
    (async () => {
      await redisClient.connect();
    })();

    console.log("Connecting to the Redis");

    redisClient.on("ready", () => {
      console.log("Connected!");
    });

    redisClient.on("error", (err) => {
      console.log("Error in the Connection");
    });
  }
  return redisClient;
}

module.exports = {
  getRedisClient: createRedisClient,
};
