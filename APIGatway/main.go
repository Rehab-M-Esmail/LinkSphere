package main

import (
    "context"
    "fmt"
    "io"
    "log"
    "net/http"
    "os"
    "strings"
    "time"

    "github.com/gin-contrib/cors"
    "github.com/gin-gonic/gin"
    "github.com/go-redis/redis/v9"
    "github.com/golang-jwt/jwt/v4"
    "github.com/joho/godotenv"
)

var (
    jwtSecret []byte
    redisClient *redis.Client
    ctx = context.Background()

    userServiceURL        string
    postServiceURL        string
    chatServiceURL        string
    dashboardServiceURL   string
    notificationServiceURL string
    eventServiceURL       string
    analyticsServiceURL   string
)

func main() {
    if err := godotenv.Load(); err != nil {
        log.Fatal("Error loading .env file")
    }

    jwtSecret = []byte(os.Getenv("JWT_SECRET"))

    redisClient = redis.NewClient(&redis.Options{
        Addr:     os.Getenv("REDIS_ADDR"),
        Password: "",
        DB:       0,
    })

    userServiceURL = os.Getenv("USER_SERVICE_URL")
    postServiceURL = os.Getenv("POST_SERVICE_URL")
    chatServiceURL = os.Getenv("CHAT_SERVICE_URL")
    dashboardServiceURL = os.Getenv("DASHBOARD_SERVICE_URL")
    notificationServiceURL = os.Getenv("NOTIFICATION_SERVICE_URL")
    eventServiceURL = os.Getenv("EVENT_SERVICE_URL")
    analyticsServiceURL = os.Getenv("ANALYTICS_SERVICE_URL")

    r := gin.Default()
    r.Use(cors.Default())
    r.Use(rateLimitMiddleware(redisClient))
    r.Use(concurrencyMiddleware(redisClient))

    r.GET("/health", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{"status": "API Gateway is running"})
    })

    r.POST("/login", googleOAuthHandler)

    auth := r.Group("/")
    auth.Use(authMiddleware())
    {
        auth.Any("/user/*any", forwardTo(userServiceURL))
        auth.Any("/post/*any", forwardTo(postServiceURL))
        auth.Any("/chat/*any", forwardTo(chatServiceURL))
        auth.Any("/dashboard/*any", forwardTo(dashboardServiceURL))
        auth.Any("/notification/*any", forwardTo(notificationServiceURL))
        auth.Any("/event/*any", forwardTo(eventServiceURL))
        auth.Any("/analytics/*any", forwardTo(analyticsServiceURL))
    }

    port := ":" + os.Getenv("GATEWAY_PORT")
    log.Printf("API Gateway running on %s", port)
    r.Run(port)
}

func forwardTo(target string) gin.HandlerFunc {
    return func(c *gin.Context) {
        finalURL := target + c.Request.URL.Path
        if c.Request.URL.RawQuery != "" {
            finalURL += "?" + c.Request.URL.RawQuery
        }

        req, err := http.NewRequest(c.Request.Method, finalURL, c.Request.Body)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create request"})
            return
        }

        for k, v := range c.Request.Header {
            req.Header[k] = v
        }

        client := &http.Client{Timeout: 15 * time.Second}
        resp, err := client.Do(req)
        if err != nil {
            c.JSON(http.StatusServiceUnavailable, gin.H{"error": "service unavailable"})
            return
        }
        defer resp.Body.Close()

        c.Status(resp.StatusCode)
        for k, v := range resp.Header {
            c.Writer.Header()[k] = v
        }

        bodyBytes, _ := io.ReadAll(resp.Body)
        c.Writer.Write(bodyBytes)
    }
}

func authMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        tokenString := c.GetHeader("Authorization")
        if tokenString == "" {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization token not provided"})
            return
        }
        tokenString = strings.TrimPrefix(tokenString, "Bearer ")
        token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
            return jwtSecret, nil
        })
        if err != nil || !token.Valid {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
            return
        }
        c.Next()
    }
}

func googleOAuthHandler(c *gin.Context) {
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "email": "user@example.com",
    })
    tokenString, err := token.SignedString(jwtSecret)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create token"})
        return
    }
    c.JSON(http.StatusOK, gin.H{"token": tokenString})
}

func rateLimitMiddleware(rdb *redis.Client) gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Next()
    }
}

func concurrencyMiddleware(rdb *redis.Client) gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Next()
    }
}
func rateLimitMiddleware(rdb *redis.Client) gin.HandlerFunc {
    return func(c *gin.Context) {
        userIP := c.ClientIP()
        key := "rate_limit:" + userIP

        // Redis Key and Expiry
        limit := 100
        duration := 60 // 60 seconds

        // Get the current request count from Redis
        current, err := rdb.Get(c, key).Int()
        if err != nil && err != redis.Nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
            return
        }

        if current >= limit {
            c.JSON(http.StatusTooManyRequests, gin.H{"error": "Rate limit exceeded"})
            c.Abort()
            return
        }

        // Increment the request count and set expiration
        err = rdb.Set(c, key, current+1, time.Duration(duration)*time.Second).Err()
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
            return
        }

        c.Next()
    }
}
func concurrencyMiddleware(rdb *redis.Client) gin.HandlerFunc {
    return func(c *gin.Context) {
        userIP := c.ClientIP()
        concurrencyKey := "concurrency_limit:" + userIP

        // Check the current concurrency usage for the user
        current, err := rdb.Get(c, concurrencyKey).Int()
        if err != nil && err != redis.Nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
            return
        }

        if current >= 10 { // Max 10 concurrent requests per user
            c.JSON(http.StatusTooManyRequests, gin.H{"error": "Concurrency limit reached"})
            c.Abort()
            return
        }

        // Increment the concurrency usage and allow request to proceed
        err = rdb.Incr(c, concurrencyKey).Err()
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
            return
        }

        // Decrease the concurrency usage after the request is completed
        defer func() {
            rdb.Decr(c, concurrencyKey)
        }()

        c.Next()
    }
}
func loggingMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        method := c.Request.Method
        path := c.Request.URL.Path
        log.Printf("Request - Method: %s, Path: %s", method, path)

        c.Next()

        status := c.Writer.Status()
        log.Printf("Response - Status: %d, Method: %s, Path: %s", status, method, path)
    }
}
func googleOAuthHandler(c *gin.Context) {
    // Simulating OAuth login
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "email": "user@example.com",
    })
    tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create token"})
        return
    }
    c.JSON(http.StatusOK, gin.H{"token": tokenString})
}
