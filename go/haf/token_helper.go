package haf

import (
	"errors"

	"github.com/dgrijalva/jwt-go"
)

type TokenHelper interface {
	ValidateJwt(jwToken string) (bool, error)
	Decode(tokenType string, token string) (*DataUserClaims, error)
	decodeJwt(idToken string) (*DataUserClaims, error)
	decodeBase64(base64 string) (*DataUserClaims, error)
}

type Config struct {
	TokenSignature string
}

type tokenHelper struct {
	config *Config
}

func NewTokenHelper(tokenSignature string) TokenHelper {
	return &tokenHelper{&Config{TokenSignature: tokenSignature}}
}

func (th tokenHelper) ValidateJwt(jwToken string) (bool, error) {
	token, err := jwt.Parse(jwToken, th.getSignature)
	if err != nil {
		return false, err
	}
	return token.Valid, err
}

func (th tokenHelper) Decode(tokenType string, token string) (*DataUserClaims, error) {
	switch tokenType {
	case "jwt":
		return th.decodeJwt(token)
	case "base64":
		return th.decodeBase64(token)
	default:
		return nil, errors.New("Failed to decode: Unkown token type")
	}
}

func (th tokenHelper) getSignature(token *jwt.Token) (interface{}, error) {
	if th.config.TokenSignature == "" {
		return jwt.UnsafeAllowNoneSignatureType, nil
	}
	return []byte(th.config.TokenSignature), nil
}

func (th tokenHelper) decodeJwt(idToken string) (*DataUserClaims, error) {
	claims := &DataUserClaims{}

	token, err := jwt.ParseWithClaims(idToken, claims, th.getSignature)

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*DataUserClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, err
}

func (th tokenHelper) decodeBase64(idToken string) (*DataUserClaims, error) {
	return nil, nil
}
