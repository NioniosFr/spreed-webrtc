package haf

import (
	"encoding/base64"
	"encoding/json"
	"net/url"

	"errors"

	"github.com/dgrijalva/jwt-go"
)

type TokenHelper interface {
	Validate(tokenType string, token string) (bool, error)
	validateJwt(jwToken string) (bool, error)
	validateBase64(base64Token string) (bool, error)

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

func (th tokenHelper) Validate(tokenType string, token string) (bool, error) {
	switch tokenType {
	case "jwt":
		return th.validateJwt(token)
	case "base64":
		return th.validateBase64(token)
	default:
		return false, errors.New("Failed to validate: Unkown token type")
	}
}

func (th tokenHelper) validateJwt(jwToken string) (bool, error) {
	token, err := jwt.Parse(jwToken, th.getSignature)
	if err != nil {
		return false, err
	}
	return token.Valid, err
}

func (th tokenHelper) validateBase64(base64Token string) (bool, error) {
	_, err := base64.URLEncoding.DecodeString(base64Token)
	if err != nil {
		return false, err
	}
	return true, nil
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
	uDec, err := base64.URLEncoding.DecodeString(idToken)
	if err != nil {
		return nil, err
	}

	js, err := url.QueryUnescape(string(uDec))
	if err != nil {
		return nil, err
	}

	var duc DataUserClaims
	err = json.Unmarshal([]byte(js), &duc)
	if err != nil {
		return nil, err
	}

	return &duc, nil
}
