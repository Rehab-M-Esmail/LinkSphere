//create token
token:=jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
	 "UserName": user.UserName,
	 "pa"
	  "TTl": time.Now().Add(time.Hour*24*100).Unix(),
})
tokenString,err:=token.SignedString(hmacSampleSecret)

if err!=nil{
	c.HTML(StatusBadRequest,
		"error/error.tpl",
	gin.H{"error":"jwt creation failed"})
	return
}

c.SetSameSite(http.SameSiteLaxMode)

c.SetCookie("Ahmed",tokenString,3600*24*100,"","",false,true)

// login
func login(c*gin.Context){
	var data formData
	c.Bind(&data)
}

//signup

func signup(c*gin,Context){
	c.redirect(http.statusFound)
}

