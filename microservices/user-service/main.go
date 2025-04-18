package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)


type Credentials struct {
	ClientID     string json:"client_id"
	ClientSecret string json:"client_secret"
	RedirectURL  string json:"redirect_url"
}


	
type Credentials struct {
	ClientID     string json:"client_id"
	ClientSecret string json:"client_secret"
	RedirectURL  string json:"redirect_url"
}

func main() {
	r.LoadHTMLGlob("templates/*/")
	
	models.DBMigrate()
	
	r.GET("/signup", controllers.SignupPage)
	
	r.GET("/login", controllers. LoginPage)
	
	r.POST("/signup", controllers.Signup)
	
	r.POST("/login", controllers.Login)
	
	log.Println("Server started!")

	creds, err := loadCredentials("credentials.json")
	if err != nil {
		log.Fatalf("Error loading credentials: %v", err)
	}

	
	config := &oauth2.Config{
		ClientID:     creds.ClientID,
		ClientSecret: creds.ClientSecret,
		RedirectURL:  creds.RedirectURL,
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.profile", 
			"https://www.googleapis.com/auth/userinfo.email",   
			
		},
		Endpoint: google.Endpoint,
	}

	// Create a state token to prevent CSRF attacks.
	state := "your-random-state"

	// Generate the authorization URL.
	authURL := config.AuthCodeURL(state, oauth2.AccessTypeOffline)
	fmt.Printf("Go to the following URL and authorize the application:\n%v\n", authURL)

	// Handle the callback from Google.
	http.HandleFunc("/callback", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Query().Get("state") != state {
			fmt.Fprintln(w, "Invalid state token")
			return
		}

		code := r.URL.Query().Get("code")
		if code == "" {
			fmt.Fprintln(w, "Authorization code not provided")
			return
		}

		
		token, err := config.Exchange(context.Background(), code)
		if err != nil {
			fmt.Fprintf(w, "Error exchanging code for token: %v", err)
			return
		}

		// Use the access token to make API calls.
		client := config.Client(context.Background(), token)
		userInfo, err := getUserInfo(client)
		if err != nil {
			fmt.Fprintf(w, "Error getting user info: %v", err)
			return
		}

		fmt.Fprintf(w, "Successfully authenticated!\n\nUser Info:\n%s\n", userInfo)
	})

	// Start the HTTP server to handle the callback.
	fmt.Printf("Listening on http://localhost:8080/callback\n")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// loadCredentials reads the client ID and secret from a JSON file.
func loadCredentials(filename string) (*Credentials, error) {
	b, err := ioutil.ReadFile(filename)
	if err != nil {
		return nil, fmt.Errorf("failed to read client secret file: %v", err)
	}
	var creds Credentials
	err = json.Unmarshal(b, &creds)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal client secret file: %v", err)
	}
	return &creds, nil
}


func getUserInfo(client *http.Client) (string, error) {
	resp, err := client.Get("https://www.googleapis.com/oauth2/v3/userinfo")
	if err != nil {
		return "", fmt.Errorf("failed to get user info: %v", err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response body: %v", err)
	}

	return string(body), nil
}

	