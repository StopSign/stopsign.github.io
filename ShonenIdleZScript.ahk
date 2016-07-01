
#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases.
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.
;SetMouseDelay, 0
#SingleInstance, Force
;SetBatchLines, -1

;this needed to be here a long time ago
;Used by pressing alt ` it writes in notepadd++
;the function to click at that spot
!`::
CoordMode, Mouse, Screen
CoordMode, Pixel, Screen
CoordMode, Tooltip, Screen
MouseGetPos, xpos, ypos
WinGetTitle, Title, A
StringGetPos, pos, Title, Notepad++
if(pos < 0)
	MCS(268, 1065, 100) ;notepad++ icon
Send {Enter}MCS(%xpos%, %ypos%, t){Space}{;}
MouseMove, xpos, ypos, 0
return

!q::
CoordMode, Mouse, Screen
CoordMode, Pixel, Screen
CoordMode, Tooltip, Screen
MouseGetPos, xpos, ypos
WinGetTitle, Title, A
StringGetPos, pos, Title, Notepad++
if(pos < 0)
	MCS(268, 1065, 100) ;notepad++ icon
Send %xpos%, %ypos%
MouseMove, xpos, ypos, 0
return


!w::
CoordMode, Mouse, Screen
CoordMode, Pixel, Screen
CoordMode, Tooltip, Screen
MouseGetPos, xpos, ypos
PixelGetColor, color, xpos, ypos
WinGetTitle, Title, A
StringGetPos, pos, Title, Notepad++
if(pos < 0)
	MCS(268, 1065, 100) ;notepad++ icon
Send %color%
MouseMove, xpos, ypos, 0
return


!5::
t := 3
letter = a
count := 0
While(!GetKeyState("end")) {
	if(mod(count, 4) == 0)
		letter = a
	if(mod(count, 4) == 1)
		letter = b
	if(mod(count, 4) == 2)
		letter = c
	if(mod(count, 4) == 3)
		letter = d
	Send {Click down}
	sleep, %t%
	Send {Click up}
	sleep, %t%
	Send {%letter% down}
	sleep, %t%
	Send {%letter% up}
	sleep, %t%
	count++
}
return

setDefaults() {
global
t := 50
}

	

;spin
!9::
CoordMode, Mouse, Screen
CoordMode, Pixel, Screen
CoordMode, Tooltip, Screen
t2 := 50
t := 25
t3 := 25
MouseGetPos, xpos, ypos 
While(!GetKeyState("end")) {
	MCS(xpos, ypos, t2) ;mode
	MouseMove, 993, 315, 0
	loop, 6
		heavyClick()
	While(colorIsNotVisibleQuick(839, 563, 0xFFFFFF) && !GetKeyState("End")) {
		heavyClick()
	}
	heavyClick()
	heavyClick()
	count := 0
	While(!GetKeyState("End")) {
		count++
		if(count == 33) {
			MouseMove, 993, 315, 0
			loop, 15
				heavyClick()
		}
		Send {Space down}
		if(count < 33) {
			MouseMove, 645, 498, 0
			Send {Click down}
			sleep, %t%
			MouseMove, 1027, 474, 0
			sleep, %t3%
			MouseMove, 997, 714, 0
			sleep, %t3%
			MouseMove, 640, 709, 0
			sleep, %t3%
		} else if(count >= 33) {
			MouseMove, 645, 498, 0
			Send {Click down}
			sleep, %t%
			MouseMove, 640, 709, 0
			sleep, %t3%
			MouseMove, 997, 714, 0
			sleep, %t3%
			MouseMove, 1027, 474, 0
			sleep, %t3%
		}
		Send {Space up}
		Tooltip, %count%, 1097, 295
		Send {Click up}
		if(mod(count, 3))
			if(colorIsVisibleQuick(737, 372, 0xB478B4))
				break
	}
	heavyClick()
	heavyClick()
	MCS(801, 807, 0) ;back
	MouseMove, 993, 315, 0
	heavyClick()
	heavyClick()
}
Tooltip
return

heavyClick() {
	Send {Space down}
	Send {Click down}
	sleep, 25
	Send {click up}
	Send {Space up}
}

;Brightest block
!8::
CoordMode, Mouse, Screen
CoordMode, Pixel, Screen
CoordMode, Tooltip, Screen
t2 := 50
t := 2
MouseGetPos, xpos, ypos 
While(!GetKeyState("end")) {
	MCS(xpos, ypos, t2) ;mode
	loop, 6
		heavyClick()
	While(colorIsNotVisibleQuick(785, 469, 0xFFFFFF)) {
		heavyClick()
	}
	heavyClick()
	heavyClick()
	count := 0
	While(!GetKeyState("End")) {
		count++
		Send {Space up}
		Send {Space down}
		PixelGetColor, color1, 718, 594
		PixelGetColor, color2, 873, 593
		PixelGetColor, color3, 725, 722
		PixelGetColor, color4, 879, 742
		c1 := getGrayScale(color1)
		c2 := getGrayScale(color2)
		c3 := getGrayScale(color3)
		c4 := getGrayScale(color4)
		if(c1>c2&&c1>c3&&c1>c4) {
			MouseMove, 718, 594, 0
			Send {Click down}
			sleep, %t%
			Send {Click up}
		} else if(c2>c1&&c2>c3&&c2>c4) {
			MouseMove, 873, 593, 0
			Send {Click down}
			sleep, %t%
			Send {Click up}
		} else if(c3>c2&&c3>c1&&c3>c4) {
			MouseMove, 725, 722, 0
			Send {Click down}
			sleep, %t%
			Send {Click up}
		} else {
			MouseMove, 879, 742, 0
			Send {Click down}
			sleep, %t%
			Send {Click up}
		}
		sleep, 23
		if(mod(count, 8) == 0)
			if(colorIsVisibleQuick(686, 369, 0xB478B4))
				break
	}
	MCS(792, 807, 50) ;back
}
return


; bracket hero
!7::
CoordMode, Mouse, Screen
CoordMode, Pixel, Screen
CoordMode, Tooltip, Screen
setDefaults()
t2 := 50
MouseGetPos, xpos, ypos 
While(!GetKeyState("end")) {
	MCS(xpos, ypos, t2) ;mode
	
	loop, 6
		heavyClick()
	While(colorIsNotVisibleQuick(918, 650, 0x1E961E) && !GetKeyState("End")) {
		heavyClick()
	}
	heavyClick()
	heavyClick()
	count := 0
	nextChar := getNextChar()
	firstChar()
	While(!GetKeyState("end")) {
		count++
		firstChar()
		;thisChar := nextChar
		;nextChar := getNextChar()
		;if(!(nextChar >= 1)) {
		;	break
		;}
		;useThisChar(thisChar)
		if(mod(count, 5) == 0) {
			PixelSearch, Px, Py, 711, 382, 711, 382, 0x78B496, 0, Fast
			if(!ErrorLevel) {
				break
			}
		}
	}
	heavyClick()
	heavyClick()
	heavyClick()
	heavyClick()
	MCS(793, 801, 0) ;back
	MCS(613, 374, 0) ;
	heavyClick()
	heavyClick()
	heavyClick()
	
}
return

useThisChar(thisChar) {
	global t
	heavyClick()
	if(thisChar == 1) { 
		theChar = .
		Send {Shift down}
		sleep, t
		Send {%theChar% down}
		sleep, t
		Send {%theChar% up}
		Send {Shift up}
	}
	if(thisChar == 2) { 
		theChar = 0
		Send {Shift down}
		sleep, t
		Send {%theChar% down}
		sleep, t
		Send {%theChar% up}
		Send {Shift up}
	}
	if(thisChar == 3) { 
		theChar = ]
		Send {Shift up}
		Send {%theChar% down}
		sleep, t
		Send {%theChar% up}
	}
	if(thisChar == 4) { 
		theChar = ]
		Send {Shift down}
		sleep, t
		Send {%theChar% down}
		sleep, t
		Send {%theChar% up}
		Send {Shift up}
	}
}

getNextChar() {
	Send {Click down}
	sleep, 23
	Send {Click up}
	PixelSearch, Px, Py, 755, 556, 755, 556, 0x270727, 0, Fast
	if (!ErrorLevel) { ; >
		return 1
	}
	PixelSearch, Px, Py, 755, 556, 755, 556, 0x072707, 0, Fast
	if (!ErrorLevel) { ; )
		return 2
	}
	PixelSearch, Px, Py, 755, 556, 755, 556, 0x072727, 0, Fast
	if (!ErrorLevel) { ; ]
		return 3
	}
	PixelSearch, Px, Py, 755, 556, 755, 556, 0x071727, 0, Fast
	if (!ErrorLevel) { ; }
		return 4
	}
}

firstChar() {
	t := 25
	PixelSearch, Px, Py, 812, 592, 812, 592, 0xFA32FA, 60, Fast
	if (!ErrorLevel) { ; this is >
		theChar = .
		Send {Shift down}
		Send {%theChar% down}
		Send {Click down}
		sleep, t
		Send {Click up}
		Send {%theChar% up}
		Send {Shift up}
	}
	PixelSearch, Px, Py, 817, 582, 817, 582, 0x32FA32, 60, Fast
	if (!ErrorLevel) { ; this is )
		theChar = 0
		Send {Shift down}
		Send {%theChar% down}
		Send {Click down}
		sleep, t
		Send {Click up}
		Send {%theChar% up}
		Send {Shift up}
	}
	PixelSearch, Px, Py, 817, 599, 817, 599, 0x32FAFA, 60, Fast
	if (!ErrorLevel) { 
		theChar = ]
		Send {%theChar% down}
		Send {Click down}
		sleep, t
		Send {Click up}
		Send {%theChar% up}
	}
	PixelSearch, Px, Py, 822, 575, 822, 575, 0x3296FA, 60, Fast
	if (!ErrorLevel) { ; this is }
		theChar = ]
		Send {Shift down}
		Send {%theChar% down}
		Send {Click down}
		sleep, t
		Send {Click up}
		Send {%theChar% up}
		Send {Shift up}
	}
}

 ; lorddreow
setGlobals() {
	global
	MouseGetPos, curx, cury
	MouseMove, 0, 0, 0
	PixelSearch, outputX, outputY, 0, 0, 900, 500, 0x0064C8, 0, Fast
	xOffset := Abs(507 - outputX) ; when I do this I get (507, 361)
	yOffset := Abs(361 - outputY)
	; MsgBox, %yOffset%
	MouseMove, %curx%, %cury%, 0
}

!0::
CoordMode, Pixel, Screen
setGlobals()


return

addXO(num) {
	global xOffset
	withOffset := Abs(num-xOffset)
	return withOffset
}

addYO(num) {
	global yOffset
	withOffset := Abs(num-yOffset)
	return withOffset
}

; pixel artist
!6::
useFreeMode := true  ; set this to false to use ticket mode

CoordMode, Mouse, Screen
CoordMode, Pixel, Screen
CoordMode, Tooltip, Screen
MouseGetPos, xpos, ypos
setGlobals() ;needs default screen to check positioning

MCS(addXO(973), addYO(522), 0) ;Pixel Artist
heavyClick()
heavyClick()
if(useFreeMode)
	MouseMove, addXO(557), addYO(734), 0 ;free mode
else
	MouseMove, addXO(1057), addYO(733), 0 ;ticket mode
heavyClick()
While(!GetKeyState("End")) {
	MouseMove, addXO(974), addYO(383), 0 ;move away
	loop, 6
		heavyClick()
	While(colorIsNotVisibleQuick(addXO(750), addYO(462), 0xC8C8C8) && !GetKeyState("End")) {
		heavyClick()
	}
	loop, 4
		heavyClick()
	
	leftX := addXO(604)
	middleX := addXO(799)
	rightX := addXO(995)
	topY := addYO(497)
	middleY := addYO(642)
	bottomY := addYO(794)
	
	goToNext := 0
	;q1
	While(!GetKeyState("end") && !goToNext) {
		PixelSearch, Px, Py, leftX, topY, middleX, middleY, 0x646464, 0, Fast
		MCP4(Px, Py)
		goToNext := ErrorLevel
	}

	goToNext := 0
	;q2
	While(!GetKeyState("end") && !goToNext) {
		PixelSearch, Px, Py, middleX, topY, rightX, middleY, 0x646464, 0, Fast
		MCP4(Px, Py)
		goToNext := ErrorLevel
	}

	goToNext := 0
	;q3 bottom left
	While(!GetKeyState("end") && !goToNext) {
		PixelSearch, Px, Py, leftX, middleY, middleX, bottomY, 0x646464, 0, Fast
		MCP4(Px, Py)
		goToNext := ErrorLevel
	}

	goToNext := 0
	;q4
	While(!GetKeyState("end") && !goToNext) {
		PixelSearch, Px, Py, middleX, middleY, rightX, bottomY, 0x646464, 0, Fast
		MCP4(Px, Py)
		goToNext := ErrorLevel
	}
	loop, 3
		heavyClick()
	waitForColorVisibleQuick(addXO(688), addYO(380), 0xB478B4)
	MCS(addXO(788), addYO(809), 0) ;back
	MouseMove, addXO(974), addYO(383), 0 ;move away
	loop, 8
		heavyClick()
	if(useFreeMode)
		MouseMove, addXO(557), addYO(734), 0 ;free mode
	else
		MouseMove, addXO(1057), addYO(733), 0 ;ticket mode
	heavyClick()
}

MouseMove, %xpos%, %ypos%, 0
return
; end pixel artist

MCP4(x, y) {
	toMoveX := x + 4
	toMoveY := y + 4
	MouseMove, %toMoveX%, %toMoveY%, 0
	heavyClick()
}


MCS(x, y, t) {
	if(GetKeyState("end"))
	return
	MouseMove, %x%, %y%, 0
	Click
	Sleep, %t%
}

MCST(x, y, t) {
	if(GetKeyState("end"))
	return
	MouseMove, %x%, %y%, 0
	Click
	count = 1
	loop, %t%
	{
		if(GetKeyState("end"))
		return
		if(GetKeyState("Home")) {
			stableTooltip("continuing...", 0)
			sleep, 1000
			Tooltip
			return
		}
		stableTooltip("%count% out of %t%", 0)
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
		MCS(348, 478, 50)
}

!2:: ;autoclicker
While(!GetKeyState("end")) {
Click
sleep, 10
}
return


;for starcraft
!^p::

CoordMode, mouse, screen
CoordMode, pixel, screen
CoordMode, Tooltip, Screen
MouseGetPos, Px, Py

RegClick(4)
RegClick(3)
RegClick(2)
RegClick(1)

;RegClick(8)
;RegClick(7)
;RegClick(6)
;RegClick(5)

Click
sleep, 50
MCS(Px, Py, 50) ;
return

RegClick(num) {
if(num==1) {
XPos1 := 1092
thechar = q
} else if(num==2) {
XPos1 := 1147
thechar = w
} else if(num==3) {
XPos1 := 1196
thechar = e
} else if(num==4) {
XPos1 := 1254
thechar = r
} else if(num==5) {
XPos1 := 1092
thechar = a
} else if(num==6) {
XPos1 := 1147
thechar = s
} else if(num==7) {
XPos1 := 1196
thechar = d
} else if(num==8) {
XPos1 := 1254
thechar = f
}

if(num <= 4) {
YPos1 := 298
} else if(num <= 8) {
YPos1 := 237
}


	MCS(XPos1, YPos1, 50) ;
	MCS(1213, 472, 50) ;
	Send %thechar%
	sleep, 50
}

`:: 
CoordMode, mouse, screen
CoordMode, pixel, screen
CoordMode, Tooltip, Screen
MouseGetPos, Px, Py
Click
sleep, 50
MCS(1215, 477, 50) ;
;while (!GetKeyState("End")) {
	
	
;}
MCS(Px, Py, 50) ;
return

XButton1::
makePressed1()
return

makePressed1() {
global 
pressed := 1
}

XButton2::
	makePressed0()
	While(!pressed) {
		if(GetKeyState("end"))
		return
		heavyClick()
		sleep, 15
		;Send {Click down}
		;sleep, 20
		;Send {Click up}
		;sleep, 20
	}
return

makePressed0() {
	global 
	pressed := 0
}



waitMultipleForColorNotVisibleQuick(x, y, color) {
	while(!GetKeyState("end")) {
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
	z := 0
	while (!GetKeyState("End")) {
		PixelSearch, Px, Py, %x%, %y%, %x2%, %y2%, %theColor%, 3, Fast
		if ErrorLevel {
			sleep, 10
		}
		else {
			return
		}
	}
}

waitForColorNotVisibleQuick(x, y, color) {
	x2 := x+15
	y2 := y+15
	waitForColorNotVisible(x, y, x2, y2, color)
}

waitForColorNotVisible(x, y, x2, y2, color) {
	z := 0
	while(!GetKeyState("End")) {
		PixelSearch, Px, Py, %x%, %y%, %x2%, %y2%, %color%, 3, Fast
		if ErrorLevel {
			return 1
		}
		else {
		sleep, 10
		}
	}
}

colorIsVisibleQuick(x, y, color) {
	x2 := x+15
	y2 := y+15 
	return colorIsVisible(x, y, x2, y2, color)
}

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

safeSpot() {
	MouseMove, 69, 864, 0
	sleep, 10
}

clickScrollBar(x, y) {
	if(GetKeyState("end"))
	return
	MouseMove, %x%, %y%, 0
	loop, 4 {
		Click
		sleep, 50
	}
}

down4() {
	if(GetKeyState("end"))
		return
	sleep, 150
	loop, 4 {
		Send {WheelDown}
		sleep, 50
	}
	sleep, 150
}

down3() {
if(GetKeyState("end"))
return
sleep, 150
loop, 3 {
Send {WheelDown}
sleep, 50
}
sleep, 150
}

!3::
CoordMode, mouse, screen
CoordMode, pixel, screen

;While(!GetKeyState("End")) {
paperwork()
MCS(684, 299, 50) ;
cabinet()
MCS(684, 299, 50) ;
read(0)
MCS(684, 299, 50) ;
;}
return


paperwork() {
	MCS(241, 440, 50) ;
	MCS(494, 407, 50) ;
	MCS(651, 293, 50) ;
	MCS(710, 283, 500) ;
	MCS(651, 293, 50) ;
	MCS(651, 293, 50) ;
}

cabinet() {
	MCS(393, 535, 50) ;
	MCS(497, 393, 50) ;
	MCS(708, 273, 50) ;
	MCS(708, 273, 200) ;
	While(colorIsVisibleQuick(762, 674, 0x7DCAE7)) {
	MCS(708, 273, 200) ;
	}
	MCS(708, 273, 50) ;
}


read(isDay) {

	MCS(687, 519, 50) ;
	MCS(597, 446, 50) ;
	MCS(375, 539, 50) ;
	MCS(526, 421, 50) ;
	;MCS(534, 433, 50) ;e
	MCS(526, 462, 50) ;f
	MCS(543, 487, 50) ;b
	MCS(678, 286, 50) ;
	MCS(678, 286, 50) ;
	MCS(552, 448, 50) ;
	MCS(701, 276, 50) ;
	;MCS(708, 273, 500) ;
	color := 0x7EC9E9
	if(isDay) {
		color := 0x7DCAE7
	}
	;While(colorIsVisibleQuick(762, 674, color)) {
	;	MCS(708, 273, 500) ;
	;}
	;MCS(701, 276, 50) ;
}

!4::
CoordMode, mouse, screen
CoordMode, pixel, screen
t := 100
While(!GetKeyState("End")) {

MCS(1062, 244, t) ;
MCS(1088, 246, t) ;
MCS(1109, 248, t) ;
MCS(1139, 253, t) ;
MCS(1171, 256, t) ;
MCS(1194, 260, t) ;
MCS(1229, 264, t) ;
MCS(1266, 269, t) ;
MCS(1310, 278, t) ;

}
return