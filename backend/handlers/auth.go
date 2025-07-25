package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"forum/models"
	"forum/sqlite"
	"forum/utils"
)

func RegisterUser(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse multipart form data (e.g., image + text)
	err := r.ParseMultipartForm(10 << 20) // 10 MB max
	if err != nil {
		utils.SendJSONError(w, "Error parsing form data", http.StatusBadRequest)
		return
	}

	username := r.FormValue("username")
	email := r.FormValue("email")
	password := r.FormValue("password")

	if username == "" || email == "" || password == "" {
		utils.SendJSONError(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	// Validate and sanitize username
	sanitizedUsername, err := utils.ValidateAndSanitizeString(username, 30, "username")
	if err != nil {
		utils.SendJSONError(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Additional username format validation
	if err := utils.ValidateUsername(sanitizedUsername); err != nil {
		utils.SendJSONError(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Validate and sanitize email
	sanitizedEmail, err := utils.ValidateAndSanitizeString(email, 100, "email")
	if err != nil {
		utils.SendJSONError(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Additional email format validation
	if err := utils.ValidateEmail(sanitizedEmail); err != nil {
		utils.SendJSONError(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Validate password strength
	if err := utils.ValidatePassword(password); err != nil {
		utils.SendJSONError(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Handle avatar upload
	var avatarURL string

	file, handler, err := r.FormFile("avatar")
	if err != nil {
		log.Printf("No avatar uploaded or failed to read: %v\n", err)
		avatarURL = "/static/profiles/default.png"
	} else {
		defer file.Close()

		// Ensure the static directory exists
		staticDir := "static"
		if _, err := os.Stat(staticDir); os.IsNotExist(err) {
			if err := os.MkdirAll(staticDir, 0o755); err != nil {
				utils.SendJSONError(w, "Failed to create static directory", http.StatusInternalServerError)
				return
			}
		}

		// Sanitize and build a safe filename
		safeFilename := filepath.Base(handler.Filename)
		avatarFilename := fmt.Sprintf("avatar_%d_%s", time.Now().UnixNano(), safeFilename)
		avatarPath := filepath.Join(staticDir, avatarFilename)

		// Create destination file
		dst, err := os.Create(avatarPath)
		if err != nil {
			log.Printf("Error creating file: %v\n", err)
			utils.SendJSONError(w, "Failed to save avatar", http.StatusInternalServerError)
			return
		}
		defer dst.Close()

		// Optionally check MIME type (optional and basic)
		buf := make([]byte, 512)
		_, err = file.Read(buf)
		if err != nil {
			utils.SendJSONError(w, "Error reading avatar data", http.StatusBadRequest)
			return
		}
		filetype := http.DetectContentType(buf)
		if filetype != "image/jpeg" && filetype != "image/png" && filetype != "image/gif" {
			utils.SendJSONError(w, "Unsupported image format (use JPG, PNG, or GIF)", http.StatusBadRequest)
			return
		}

		// Reset file pointer before copying
		file.Seek(0, io.SeekStart)

		// Save the file
		_, err = io.Copy(dst, file)
		if err != nil {
			log.Printf("Error saving avatar: %v\n", err)
			utils.SendJSONError(w, "Error saving avatar", http.StatusInternalServerError)
			return
		}

		avatarURL = "/" + avatarPath
		log.Printf("Avatar uploaded successfully: %s\n", avatarURL)
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		utils.SendJSONError(w, "Error hashing password", http.StatusInternalServerError)
		return
	}

	// Save user to DB
	err = sqlite.CreateUser(db, sanitizedUsername, sanitizedEmail, hashedPassword, avatarURL)
	if err != nil {
		if sqlite.IsUniqueConstraintError(err) {
			utils.SendJSONError(w, "Username or email already exists", http.StatusConflict)
		} else {
			utils.SendJSONError(w, "Database error", http.StatusInternalServerError)
		}
		return
	}

	utils.SendJSONResponse(w, map[string]string{"message": "User registered successfully"}, http.StatusCreated)
}

func LoginUser(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var credentials struct {
		Email    string `json:"email"`
		Username string `json:"username"`
		Password string `json:"password"`
	}

	err := json.NewDecoder(r.Body).Decode(&credentials)
	if err != nil {
		http.Error(w, "Invalid credentials format", http.StatusBadRequest)
		return
	}
	if credentials.Password == "" {
		utils.SendJSONError(w, "Password cannot be empty", http.StatusBadRequest)
		return
	}

	// Check if either email or username is provided
	if credentials.Email == "" && credentials.Username == "" {
		utils.SendJSONError(w, "Email or username is required", http.StatusBadRequest)
		return
	}

	var user models.User

	// Try to get user by email first, then by username
	if credentials.Email != "" {
		// Validate and sanitize email
		sanitizedEmail, err := utils.ValidateAndSanitizeString(credentials.Email, 100, "email")
		if err != nil {
			utils.SendJSONError(w, "Invalid email format", http.StatusBadRequest)
			return
		}

		// Additional email format validation
		if err := utils.ValidateEmail(sanitizedEmail); err != nil {
			utils.SendJSONError(w, "Invalid email format", http.StatusBadRequest)
			return
		}

		// Get user from DB by email
		user, err = sqlite.GetUserByEmail(db, sanitizedEmail)
		if err != nil {
			if err == sql.ErrNoRows {
				utils.SendJSONError(w, "Invalid credentials", http.StatusUnauthorized)
				return
			}
			utils.SendJSONError(w, "Database error", http.StatusInternalServerError)
			return
		}
	} else {
		// Validate and sanitize username
		sanitizedUsername, err := utils.ValidateAndSanitizeString(credentials.Username, 30, "username")
		if err != nil {
			utils.SendJSONError(w, "Invalid username format", http.StatusBadRequest)
			return
		}

		// Additional username format validation
		if err := utils.ValidateUsername(sanitizedUsername); err != nil {
			utils.SendJSONError(w, "Invalid username format", http.StatusBadRequest)
			return
		}

		// Get user from DB by username
		user, err = sqlite.GetUserByUsername(db, sanitizedUsername)
		if err != nil {
			if err == sql.ErrNoRows {
				utils.SendJSONError(w, "Invalid credentials", http.StatusUnauthorized)
				return
			}
			utils.SendJSONError(w, "Database error", http.StatusInternalServerError)
			return
		}
	}

	// Validate password
	if !utils.CheckPasswordHash(credentials.Password, user.PasswordHash) {
		utils.SendJSONError(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Delete all existing sessions for this user (single session policy)
	// This ensures only the most recent login session persists
	err = sqlite.DeleteAllUserSessions(db, user.ID)
	if err != nil {
		log.Printf("Warning: Failed to delete existing sessions for user %s: %v", user.ID, err)
		// Continue anyway - this is not critical for login to succeed
	}

	// Create new session in database (this will be the only active session)
	sessionID, err := sqlite.CreateSession(db, user.ID)
	if err != nil {
		utils.SendJSONError(w, "Failed to create session", http.StatusInternalServerError)
		return
	}

	// Set session cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "session_id",
		Value:    sessionID,
		Path:     "/",
		Expires:  time.Now().Add(24 * time.Hour),
		HttpOnly: true,
	})

	utils.SendJSONResponse(w, map[string]string{"message": "Logged in"}, http.StatusOK)
}

func GetUser(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	// Check HTTP method first
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, err := utils.GetUserIDFromSession(db, r)
	// log.Printf("errr: %v\n", err)

	if err != nil || userID == "" {
		utils.SendJSONError(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	user, err := sqlite.GetUserByID(db, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.SendJSONError(w, "Unauthorized", http.StatusUnauthorized)
		} else {
			utils.SendJSONError(w, "User not found", http.StatusNotFound)
		}
		return
	}

	utils.SendJSONResponse(w, user, http.StatusOK)
}

func LogoutUser(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get session cookie - if no cookie, still return success (graceful logout)
	sessionCookie, err := r.Cookie("session_id")
	if err != nil {
		// No session cookie, but still return success
		utils.SendJSONResponse(w, map[string]string{"message": "Logged out"}, http.StatusOK)
		return
	}

	// Remove session from database
	err = sqlite.DeleteSession(db, sessionCookie.Value)
	if err != nil && err != sql.ErrNoRows {
		utils.SendJSONError(w, "Failed to log out", http.StatusInternalServerError)
		return
	}

	// Clear session cookie
	http.SetCookie(w, &http.Cookie{
		Name:   "session_id",
		Value:  "",
		Path:   "/",
		MaxAge: -1,
	})

	utils.SendJSONResponse(w, map[string]string{"message": "Logged out"}, http.StatusOK)
}

func RequireAuth(db *sql.DB, w http.ResponseWriter, r *http.Request) (string, bool) {
	userID, err := utils.GetUserIDFromSession(db, r)
	// log.Printf("checking more errors: %v\n", err)

	if err != nil || userID == "" {
		http.Error(w, "Unauthorized2", http.StatusUnauthorized)
		return "", false
	}
	return userID, true
}

func GetOwner(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	userId := r.URL.Query().Get("user_id")

	// Validate user ID format (UUID)
	if err := utils.ValidateUUID(userId); err != nil {
		utils.SendJSONError(w, "Invalid user ID format", http.StatusBadRequest)
		return
	}

	user, err := sqlite.GetUserByID(db, userId)
	if err != nil {
		utils.SendJSONError(w, "User not found", http.StatusNotFound)
		return
	}
	utils.SendJSONResponse(w, user, http.StatusOK)
}
