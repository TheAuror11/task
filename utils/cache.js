const redis = require("redis");
const client = redis.createClient();

client.on("error", (err) => console.error("Redis error:", err));

const cacheMiddleware = (req, res, next) => {
  const cacheKey = req.originalUrl;
  client.get(cacheKey, (err, data) => {
    if (err) throw err;

    if (data) {
      res.send(JSON.parse(data));
    } else {
      next();
    }
  });
};

const setCache = (key, value) => {
  client.setex(key, 3600, JSON.stringify(value)); // Cache for 1 hour
};

module.exports = { cacheMiddleware, setCache };
