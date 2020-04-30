
#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases.
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.

;Made by Phurple/Stop_Sign
;
;This script runs on AutoHotkey (AHK), a free, low-size download
;for keyboard I/O
;If you want help setting up, ask


originalOffsetX := 278 
originalOffsetY := 296
	

!1::
t := 150

MsgBox, Click OK, then the browser window, then press 1 and wait a few seconds for the mouse to move to the top left of the game 

While(!GetKeyState("1")) {
}

WinGetPos, xZero, yZero, winWidth, winHeight, A

;MsgBox,  width: %winWidth%, height: %winHeight%


PixelSearch, greyX, greyY, 0, 110, %winWidth%, %winHeight%, 0x2B2B2B, 3, Fast
if ErrorLevel {
	MsgBox, Error! Try again on the right window.
	return
}

greyX2 := greyX + 500
greyY2 := greyY + 500 


;default search to get the Y value 
PixelSearch, blackX, blackY, greyX, greyY, greyX2, greyY2, 0x000000, 3, Fast 
if ErrorLevel {
	MsgBox, Error! Try again on the right window.
	return 
}

blackY1 := blackY + 5
blackY2 := blackY + 5 

;custom 1 pixel width search to get the x value 

blackX1 := 0
loop, 500 {
	blackX2 := blackX1
	PixelSearch, blackX, Py, blackX1, blackY1, blackX2, blackY2, 0x000000, 1, Fast 
	if ErrorLevel {
		blackX1++
	} else {
		break
	}
}
if(!(blackX > 0)) {
	MsgBox, Error! Try again on the right window.
	return 
}


MouseMove, blackX, blackY, 0 

FileDelete, epicHeroCoords.txt
FileAppend, %blackX%`n%blackY%, epicHeroCoords.txt

return 


;click upgrade 
!2::
readOffsetFile()

t := 100 
MCS(331, 902) ;
z := colorIsVisibleQuick(66, 487, 0x2B2B2B)

return 

readOffsetFile() {
	global xOffset
	global yOffset
	if(!FileExist("epicHeroCoords.txt"))
		MsgBox, Coords have not been set yet, use alt 1 first!

	lineNum := 0
	Loop, read, epicHeroCoords.txt 
	{
		if(lineNum == 0) 
			xOffset := A_LoopReadLine
		if(lineNum == 1) 
			yOffset := A_LoopReadLine
		lineNum++
	}
	
}



!3::
readOffsetFile()
t := 150 
MouseGetPos, returnX, returnY

MCS(415, 899) ;skill table 
sleep, 100 
MCS(387, 871) ;angel skills 
if(colorIsVisibleQuick(317, 417, 0xE6DAEF)) { ;check for angel 
	Send {1 down}
	
	MCS(493, 597) ;god bless
	MCS(335, 648) ;muscle 
	MCS(488, 645) ;magic 
	MCS(339, 697) ;protect 
	MCS(494, 691) ;haste 
	MCS(341, 749) ;gold 
	MCS(494, 742) ;wings 
	Send {1 up}
}
	

MouseMove, returnX, returnY, 0

return 





































































































































	
	
	
	
	
	
	
	
	
	
	
	


;Used by pressing alt ` it writes in notepad++
;the function to click at that spot
!`::
CoordMode, Mouse, Window
MouseGetPos, xpos, ypos

CoordMode, Mouse, Screen
MouseGetPos, returnX, returnY
WinGetTitle, Title, A
StringGetPos, pos, Title, Notepad++
if(pos < 0)
	MCSH(422, 1059, 100) ;notepad++ icon
Send {Enter}MCS(%xpos%, %ypos%){Space}{;}
MouseMove, returnX, returnY, 0
return

!q::
CoordMode, Mouse, Window
MouseGetPos, xpos, ypos

CoordMode, Mouse, Screen
MouseGetPos, returnX, returnY
WinGetTitle, Title, A
StringGetPos, pos, Title, Notepad++
if(pos < 0)
	MCSH(422, 1059, 100) ;notepad++ icon
Send %xpos%, %ypos%
MouseMove, returnX, returnY, 0
return

!w::
CoordMode, Mouse, Screen
CoordMode, Pixel, Screen
MouseGetPos, xpos, ypos
PixelGetColor, color, %xpos%, %ypos%
WinGetTitle, Title, A
StringGetPos, pos, Title, Notepad++
if(pos < 0)
	MCSH(422, 1059, 100) ;notepad++ icon
Send %color%
MouseMove, xpos, ypos, 0
return


MCS(x, y) {
	global t
	global xOffset 
	global yOffset 
	global originalOffsetX
	global originalOffsetY
	if(GetKeyState("left"))
	return
	newX := x + xOffset - originalOffsetX
	newY := y + yOffset - originalOffsetY
	MouseMove, %newX%, %newY%, 0
	sleep, 10
	Click
	Sleep, %t%
}

MCSA(Px2, Py2) {
	global t
	if(GetKeyState("left"))
	return
	MouseMove, %x%, %y%, 0
	sleep, 10 
	Click 
	Sleep, %t%

}

MCSH(x, y, t) {
	if(GetKeyState("left"))
	return
	MouseMove, %x%, %y%, 0
	Send {Click down}
	sleep, 10 
	Send {Click up} 
	Sleep, %t%
}

MCSHR(x, y) {
	global t
	global xOffset 
	global yOffset 
	global originalOffsetX
	global originalOffsetY
	if(GetKeyState("left"))
	return
	newX := x + xOffset - originalOffsetX
	newY := y + yOffset - originalOffsetY
	MouseMove, %newX%, %newY%, 0
	Send {RButton down}
	sleep, 25
	Send {RButton up}
	Sleep, %t%
}

MCSHRA(x, y) {
	global t
	if(GetKeyState("left"))
	return
	MouseMove, %x%, %y%, 0
	Send {RButton down}
	sleep, 25
	Send {RButton up}
	Sleep, %t%
}


waitForColorVisibleQuick(x, y, color) {
	x2 := x+15
	y2 := y+15
	waitForColorVisible(x, y, x2, y2, color)
}

waitForColorVisible(x, y, x2, y2, color) {
	safeSpot() ;If game tooltips interrupt you
	global xOffset 
	global yOffset 
	global originalOffsetX
	global originalOffsetY
	newX := x + xOffset - originalOffsetX
	newY := y + yOffset - originalOffsetY
	newX2 := x2 + xOffset - originalOffsetX
	newY2 := y2 + yOffset - originalOffsetY
	z := 0
	while (!GetKeyState("left")) {
		PixelSearch, Px, Py, %newX%, %newY%, %newX2%, %newY2%, %color%, 3, Fast
		if ErrorLevel {
			sleep, 10
			z++ ;How long you've waited
			;Tooltip, %z%
		}
		else {
			return
		}
	}
  Tooltip
}

waitForColorNotVisibleQuick(x, y, color) {
	x2 := x+15
	y2 := y+15
	waitForColorNotVisible(x, y, x2, y2, color)
}

waitForColorNotVisible(x, y, x2, y2, color) {
	safeSpot()
	z := 0
	global xOffset 
	global yOffset 
	global originalOffsetX
	global originalOffsetY
	newX := x + xOffset - originalOffsetX
	newY := y + yOffset - originalOffsetY
	newX2 := x2 + xOffset - originalOffsetX
	newY2 := y2 + yOffset - originalOffsetY
	while(!GetKeyState("left")) {
		PixelSearch, Px, Py, %newX%, %newY%, %newX2%, %newY2%, %color%, 3, Fast
		if ErrorLevel {
			return 1
		}
		else {
			sleep, 10
			z++ ;How long you've waited
			;Tooltip, %z%
		}
	}
}

colorIsVisibleQuick(x, y, color) {
	x2 := x+15
	y2 := y+15 
	return colorIsVisible(x, y, x2, y2, color)
}

colorIsVisible(x, y, x2, y2, color) {
	global xOffset 
	global yOffset 
	global originalOffsetX
	global originalOffsetY
	newX := x + xOffset - originalOffsetX
	newY := y + yOffset - originalOffsetY
	newX2 := x2 + xOffset - originalOffsetX
	newY2 := y2 + yOffset - originalOffsetY
	PixelSearch, Px, Py, %newX%, %newY%, %newX2%, %newY2%, %color%, 5, Fast
	if ErrorLevel {
		return 0
	}
	else {
		return 1
	}
}

colorIsNotVisibleQuick(x, y, color) {
	x2 := x+15
	y2 := y+15 
	return colorIsNotVisible(x, y, x2, y2, color)
}

colorIsNotVisible(x, y, x2, y2, color) {
	global xOffset 
	global yOffset 
	global originalOffsetX
	global originalOffsetY
	newX := x + xOffset - originalOffsetX
	newY := y + yOffset - originalOffsetY
	newX2 := x2 + xOffset - originalOffsetX
	newY2 := y2 + yOffset - originalOffsetY
	PixelSearch, Px, Py, %newX%, %newY%, %newX2%, %newY2%, %color%, 5, Fast
	if ErrorLevel {
		return 1
	}
	else {
		return 0
	}
}

clickUntilColorVisible(x1, y1, x2, y2, color) {
	while(!colorIsVisibleQuick(x2, y2, color)) {
		MouseMove, %x1%, %y1%, 0
		Click
	}
}


clickOn(x, y, x2, y2, theColor) {
	global xOffset 
	global yOffset 
	global originalOffsetX
	global originalOffsetY
	newX := x + xOffset - originalOffsetX
	newY := y + yOffset - originalOffsetY
	newX2 := x2 + xOffset - originalOffsetX
	newY2 := y2 + yOffset - originalOffsetY
	PixelSearch, Px, Py, %newX%, %newY%, %newX2%, %newY2%, %color%, 3, Fast
	if ErrorLevel {
		return false
	} else {
		Px2 := Px + 1
		Py2 := Py + 1
		;MouseGetPos, xpos, ypos 
		MCSA(Px2, Py2)
		;MouseMove, xpos, ypos, 0
		safeSpot()
		return true
	}
}

rClickOn(x, y, x2, y2, color) {
	global xOffset 
	global yOffset 
	global originalOffsetX
	global originalOffsetY
	newX := x + xOffset - originalOffsetX
	newY := y + yOffset - originalOffsetY
	newX2 := x2 + xOffset - originalOffsetX
	newY2 := y2 + yOffset - originalOffsetY
	PixelSearch, Px, Py, %newX%, %newY%, %newX2%, %newY2%, %color%, 3, Fast
	if ErrorLevel {
		return false
	} else {
		Px2 := Px + 1
		Py2 := Py + 1
		;MouseGetPos, xpos, ypos 
		MCSHRA(Px2, Py2)
		;MouseMove, xpos, ypos, 0
		return true
	}
}

safeSpot() {
	global xOffset 
	global yOffset 
	global originalOffsetX
	global originalOffsetY
	if(GetKeyState("left"))
	return 
	newX := 509 + xOffset - originalOffsetX
	newY := 365 + yOffset - originalOffsetY
	MouseMove, %newX%, %newY%, 0
	sleep, 100
}