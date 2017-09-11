package haf

import "github.com/dgrijalva/jwt-go"

// DataUserClaims ...
type DataUserClaims struct {
	Roles        string   `json:"Role"`
	AllowedRooms []string `json:"Room"`
	jwt.StandardClaims
}

// DataTokensAuthentication ...
type DataTokensAuthentication struct {
	AccessToken string `json:"access_token"`
	IdToken     string `json:"id_token"`
}
