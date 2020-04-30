
#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases.
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.

;Made by Phurple/Stop_Sign
;
;This script runs on AutoHotkey (AHK), a free, low-size download
;for keyboard I/O
;If you want help setting up, ask



	

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

FileDelete, test.txt
FileAppend, %blackX%`n%blackY%, test.txt

return 


;click upgrade 
!2::
readOffsetFile()

t := 100 
MCSO(331, 902) ;

return 

readOffsetFile() {
	global xOffset
	global yOffset
	
	lineNum := 0
	Loop, read, test.txt 
	{
		if(lineNum == 0) 
			xOffset := A_LoopReadLine
		if(lineNum == 1) 
			yOffset := A_LoopReadLine
		lineNum++
	}
}












































































































































	
	
	
	
	
	
	
	
	
	
	
	


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
Send {Enter}MCSO(%xpos%, %ypos%){Space}{;}
MouseMove, returnX, returnY, 0
return

!q::
CoordMode, Mouse, Screen
CoordMode, Pixel, Screen
MouseGetPos, xpos, ypos
WinGetTitle, Title, A
StringGetPos, pos, Title, Notepad++
if(pos < 0)
	MCSH(422, 1059, 100) ;notepad++ icon
Send %xpos%, %ypos%
MouseMove, xpos, ypos, 0
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




MS(x, y, t) {
	if(GetKeyState("left"))
	return
	MouseMove, %x%, %y%, 0
	Sleep, %t%
}

MCS(x, y, t) {
	if(GetKeyState("left"))
	return
	MouseMove, %x%, %y%, 0
	sleep, 10
	Click
	Sleep, %t%
}

MCSO(x, y) {
	global t
	global xOffset 
	global yOffset 
	if(GetKeyState("left"))
	return
	newX := x + xOffset - 278
	newY := y + yOffset - 296
	MouseMove, %newX%, %newY%, 0
	sleep, 10
	Click
	Sleep, %t%
}

MCSD(x, y, t) {
	if(GetKeyState("left"))
	return
	MouseMove, %x%, %y%, 0
	Click
	sleep, 5
	Click
	sleep, 5
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

MCSHR(x, y, t) {
	if(GetKeyState("left"))
	return
	MouseMove, %x%, %y%, 0
	Send {RButton down}
	sleep, 25
	Send {RButton up}
	Sleep, %t%
}

MCSHH(x, y, t) {
	if(GetKeyState("left"))
	return
	MouseMove, %x%, %y%, 0
	heavyClick() 
	Sleep, %t%
}

heavyClick() {
	Send {Click down}
  sleep, 25
  Send {Click up}
  sleep, 25
}

MCSHT(x, y, time) {
	global t
	if(GetKeyState("left"))
	return
	MouseMove, %x%, %y%, 0
	Click
	count = 1
	loop, %time%
	{
		if(GetKeyState("left"))
		return
		if(GetKeyState("Home")) {
			stableTooltip("continuing...", 0)
			sleep, 1000
			Tooltip
			return
		}
		stableTooltip(%count% + "out of" + %time%, 0)
		sleep, 1000
		count++
	}
	Tooltip,
}

stableTooltip(theString, isSafeAfter) {
	global tooltipX
	global tooltipY
	Tooltip, %theString%, %tooltipX%, %tooltipY%
	if(isSafeAfter)
		MCSH(348, 478, 50)
}


waitMultipleForColorNotVisibleQuick(x, y, color) {
	while(!GetKeyState("left")) {
		colorIsVisibleQuick(x, y, color)
		waitForColorNotVisibleQuick(x, y, color)

	}
}


waitForColorVisibleQuick(x, y, color) {
	x2 := x+15
	y2 := y+15
	waitForColorVisible(x, y, x2, y2, color)
}

waitForColorVisible(x, y, x2, y2, theColor) {
	;safeSpot() ;If game tooltips interrupt you
	z := 0
	while (!GetKeyState("left")) {
		PixelSearch, Px, Py, %x%, %y%, %x2%, %y2%, %theColor%, 3, Fast
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
	;safeSpot()
	z := 0
	while(!GetKeyState("left")) {
		PixelSearch, Px, Py, %x%, %y%, %x2%, %y2%, %color%, 3, Fast
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

; isColorVisible
colorIsVisible(x, y, x2, y2, color) {
	PixelSearch, Px, Py, %x%, %y%, %x2%, %y2%, %color%, 8, Fast
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
	PixelSearch, Px, Py, %x%, %y%, %x2%, %y2%, %color%, 3, Fast
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
	global t
	PixelSearch, Px, Py, %x%, %y%, %x2%, %y2%, %theColor%, 3, Fast
	if ErrorLevel {
		return false
	} else {
		Px2 := Px + 1
		Py2 := Py + 1
		;MouseGetPos, xpos, ypos 
		MCS(Px2, Py2, t)
		;MouseMove, xpos, ypos, 0
		safeSpot()
		return true
	}
}

rClickOn(x, y, x2, y2, theColor) {
	global t
	PixelSearch, Px, Py, %x%, %y%, %x2%, %y2%, %theColor%, 3, Fast
	if ErrorLevel {
		return false
	} else {
		Px2 := Px + 1
		Py2 := Py + 1
		;MouseGetPos, xpos, ypos 
		MCSHR(Px2, Py2, t)
		;MouseMove, xpos, ypos, 0
		return true
	}
}

safeSpot() {
	if(GetKeyState("left"))
	return 
	MouseMove, 2455, 383, 0
	sleep, 100
}

clickScrollBar(x, y) {
	if(GetKeyState("left"))
	return
	MouseMove, %x%, %y%, 0
	loop, 4 {
		Click
		sleep, 50
	}
}

down4() {
if(GetKeyState("left"))
return
sleep, 50
loop, 4 {
Send {WheelDown}
sleep, 50
}
sleep, 50
}

down3() {
if(GetKeyState("left"))
return
sleep, 150
loop, 3 {
Send {WheelDown}
sleep, 50
}
sleep, 150
}