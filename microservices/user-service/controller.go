package main

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

var hmacSampleSecret = []byte("your-secret-key")

// create token
func createToken(c *gin.Context, user struct{ UserName string }) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"UserName": user.UserName,
		"TTL":      time.Now().Add(time.Hour * 24 * 100).Unix(),
	})

	tokenString, err := token.SignedString(hmacSampleSecret)
	if err != nil {
		c.HTML(http.StatusBadRequest, "error/error.tpl", gin.H{"error": "jwt creation failed"})
		return
	}

	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("Ahmed", tokenString, 3600*24*100, "", "", false, true)
}

// login
func login(c *gin.Context) {
	var data struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	c.Bind(&data)
}

// signup
func signup(c *gin.Context) {
	c.Redirect(http.StatusFound, "/")
}
