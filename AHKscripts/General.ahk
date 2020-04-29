
#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases.
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.

;Made by Phurple/Stop_Sign
;
;This script runs on AutoHotkey (AHK), a free, low-size download
;for keyboard I/O
;If you want help setting up, ask



	



!1::
CoordMode, Mouse, Screen
CoordMode, Pixel, Screen
CoordMode, Tooltip, Screen
t := 200

While(!getKeyState("Left")) {
	doUpgrades()
	doNitro()
	sleep, 15000
	;doOvernightUpgrades()
}

return

!2::
CoordMode, Mouse, Screen
CoordMode, Pixel, Screen
CoordMode, Tooltip, Screen
t := 100

doUpgrades()

return



!3::

CoordMode, Mouse, Screen
CoordMode, Pixel, Screen
CoordMode, Tooltip, Screen
t := 200

While(!getKeyState("Left")) {
	doUpgradesAsAngel()
	doNitro()
	;doAlchemy()
	;doOvernightUpgrades()
	;buyUpgrade()
	sleep, 15000
	
}

return

!4::
CoordMode, Mouse, Screen
CoordMode, Pixel, Screen
CoordMode, Tooltip, Screen
t := 100

doUpgradesAsAngel()

return







doUpgrades() {
	global t 
	MCS(2323, 926, t) ;skill table
	MCS(2323, 926, t) ;skill table
	sleep, 100
	MCS(2313, 896, t) ;angel
	sleep, 100


	MCS(2252, 673, t) ;muscle
	MCS(2876, 887, t) ;global slot 2 
	MCS(2405, 623, t) ;god bless
	MCS(2876, 887, t) ;global slot 2 
	MCS(2249, 720, t) ;protect
	MCS(2876, 887, t) ;global slot 2 
	MCS(2399, 721, t) ;haste
	MCS(2876, 887, t) ;global slot 2 
	MCS(2252, 774, t) ;gold
	MCS(2876, 887, t) ;global slot 2 
	;MCS(2399, 773, t) ;skill
	;MCS(2876, 887, t) ;global slot 2 
	MCS(2403, 664, t) ;magic
	MCS(2876, 887, t) ;global slot 2 


	;MCS(2329, 831, t) ;warrior
	;sleep, 100
	;MCS(2249, 774, t) ;shield attack 
	
	;MCS(2243, 566, t) ;wing attack 
	;MCS(2408, 572, t) ;wing shoot 
	
	MCS(2244, 626, t) ;heal

	MCS(2876, 887, t) ;global slot 2 
}

doUpgradesAsAngel() {
	global t 
	MCS(2323, 926, t) ;skill table
	sleep, 100
	MCS(2313, 896, t) ;angel
	sleep, 100

	MCS(2405, 623, t) ;god bless
	MCS(2716, 889, t) ;slot 3 
	;MCS(2252, 673, t) ;muscle
	;MCS(2716, 889, t) ;slot 3 
	MCS(2403, 664, t) ;magic
	MCS(2716, 889, t) ;slot 3 
	MCS(2249, 720, t) ;protect
	MCS(2716, 889, t) ;slot 3 
	MCS(2399, 773, t) ;skill
	MCS(2716, 889, t) ;slot 3 
	;MCS(2399, 721, t) ;haste
	;MCS(2716, 889, t) ;slot 3 


	MCS(2408, 572, t) ;wing shoot 
	;MCS(2254, 627, t) ;heal
	MCS(2716, 889, t) ;slot 3 

}

doNitro() {
	global t 
	
	MCS(2239, 925, t) ;upgrade 
	sleep, 100 
	if(colorIsVisibleQuick(2319, 897, 0x000042)) {
		
		MCS(2238, 946, t) ;craft 
		sleep, 100 
		MCS(2323, 533, t) ;alch 
		MCS(2323, 533, t) ;alch 
		sleep, 100 
		MCS(2233, 560, t) ;1ml
		MCS(2233, 560, t) ;1ml
		sleep, 100 
		MCS(2425, 649, t) ;nitro gen 
		Send mm
		sleep, 100
		MCS(2503, 820, t) ;
		MCS(2503, 820, t) ;use all 
	}
}

doAlchemy() {
	global t 
	
	MCS(329, 912, t) ;craft
	MCS(403, 499, t) ;alchemy
	MCS(315, 526, t) ;1ml
	
	MCS(317, 610, t) ;
	Send m 
	sleep, 100 
	MCS(590, 786, t) ;use all
	MCS(590, 786, t) ;use all
}

doOvernightUpgrades() {
	global t
	
	MCS(2240, 928, t) ;upgrade
	sleep, 300 
	MCS(2412, 890, t) ;slime bank
	sleep, 300 
	MCS(2432, 780, t) ;bank cap 
	MCS(2487, 529, t) ;sleep, 100 
	
}


buyUpgrade() {
	global t 
	
	MCS(324, 894, t) ;upgrade
	sleep, 300 
	
	
	MCS(551, 696, t) ;mine 4 
	MCS(553, 736, t) ;crys 4 
	MCS(552, 776, t) ;gather 4 
	MCS(510, 692, t) ;m 3 
	MCS(510, 737, t) ;c 3 
	MCS(513, 775, t) ;g 3 
	MCS(473, 696, t) ;m 2 
	MCS(476, 740, t) ;c 2 
	MCS(478, 775, t) ;g 2 
	MCS(436, 697, t) ;m 1 
	MCS(433, 736, t) ;c 1 
	MCS(433, 779, t) ;g 1 
	
	MCS(316, 814, t) ;gold 
	MCS(356, 812, t) ;
	MCS(400, 813, t) ;
	MCS(435, 811, t) ;
	MCS(476, 812, t) ;
	MCS(515, 810, t) ;
	MCS(552, 807, t) ;mystery

}







!5::

CoordMode, Mouse, Screen
CoordMode, Pixel, Screen
CoordMode, Tooltip, Screen
t := 50

while(!GetKeyState("Left")) {

	MCS(2242, 648, t) ;
	;MCS(2368, 651, t) ;
	Send m 
	sleep, 50 
	MCS(2497, 820, t) ;use all 
	MCS(2497, 820, t) ;use all 
}

return




!6::

CoordMode, Mouse, Screen
CoordMode, Pixel, Screen
CoordMode, Tooltip, Screen
t := 50
z := 0

while(!GetKeyState("Left")) {
	if(colorIsVisibleQuick(2325, 876, 0x0078D5)) {
		if(z > 250) {
			MCS(2243, 949, t) ;craft 
			sleep, 100 
			MCS(2240, 850, t) ;use first 
			MCS(2507, 928, t) ;challenge
			sleep, 100 
		}
		
		MCS(2306, 880, t) ;start
		z := 0
	} else {
		z++
	}
	Tooltip, %z%, 2007, 749

}

return





!7::
CoordMode, Mouse, Screen
CoordMode, Pixel, Screen
CoordMode, Tooltip, Screen
t := 50
z := 450 
y := 0
x := 0

while(!GetKeyState("Left")) {
	;if(rClickOn(2602, 472, 2940, 609, 0x00C339)) { ;green spider 
	;if(rClickOn(2602, 472, 2940, 609, 0x00B5AA)) { ;yellow spider 
	;if(rClickOn(2602, 472, 2940, 609, 0xAB0025)) { ;blue spider 
	;if(rClickOn(2602, 472, 2940, 609, 0x650B4B)) { ;normal spider 
	;if(rClickOn(2602, 472, 2940, 609, 0x63B2FF)) { ;orange fox 
	;if(rClickOn(2602, 472, 2940, 609, 0x7BE7FF)) { ;yellow fox 
	;if(rClickOn(2602, 472, 2940, 609, 0xB5DB7B)) { ;green fox 
	;if(rClickOn(2602, 472, 2940, 609, 0x546725)) { ;green faerie 
	;if(rClickOn(2602, 472, 2940, 609, 0x00A2E7)) { ;yellow faerie 
	;if(rClickOn(2602, 472, 2940, 609, 0xAD2429)) { ;blue faerie 
	;if(rClickOn(2602, 472, 2940, 609, 0x6B226C)) { ;purple faerie 
		;sleep, 300
	;}
	
	;nitro 
	checkNitroOnUpgrade()
	
	z++
	if(y > 0) {
		x++
	}
	Tooltip, %z% : %y% : %x%, 2007, 749
	if(z > 1000) {
		z := 0 
		MCS(2408, 890, t) ;slime bank 
		sleep, 100 
		if(colorIsVisibleQuick(2426, 774, 0xFFBC76)) {
			y := 1
		}
		if(x > 40000) {
			MCS(2434, 776, t) ;sc cap 
			y := 0
			x := 0
		}
		
		MCS(2495, 529, t) ;go back 
		sleep, 100
	}
	
}


return


checkNitroOnUpgrade() {
	global t
	if(colorIsVisibleQuick(2319, 897, 0x000042)) { 
		
		MCS(2238, 946, t) ;craft 
		sleep, 100 
		MCS(2323, 533, t) ;alch 
		MCS(2323, 533, t) ;alch 
		sleep, 100 
		MCS(2233, 560, t) ;1ml
		MCS(2233, 560, t) ;1ml
		sleep, 100 
		MCS(2425, 649, t) ;nitro gen 
		Send mm
		sleep, 100
		MCS(2503, 820, t) ;
		MCS(2503, 820, t) ;use all 
		
		MCS(2244, 927, t) ;upgrade 
		sleep, 100 
	}
}





!8::
CoordMode, Mouse, Screen
CoordMode, Pixel, Screen
CoordMode, Tooltip, Screen
t := 50

while(!GetKeyState("Left")) {
	MCSHR(2772, 515, t) ;
}

return 




!9::
CoordMode, Mouse, Screen
CoordMode, Pixel, Screen
CoordMode, Tooltip, Screen
t := 150

;while(!GetKeyState("Left")) {

	MCS(2501, 945, t) ;system 
	sleep, 100 
	MCS(2501, 945, t) ;system 
	sleep, 100 
	clickOn(2227, 681, 2231, 685, 0x212021) ;autoprogress on 
	sleep, 100 
	
	MCS(2409, 948, t) ;rebirth
	sleep, 100 
	;MCS(2296, 560, t) ;warrior
	MCS(2295, 588, t) ;wizard
	sleep, 100 
	MCS(2333, 900, t) ;rebirth 
	sleep, 300 
	MCS(2604, 832, t) ;OK
	sleep, 5000 
	MCS(2604, 832, t) ;OK
	sleep, 5000 
	
	
	
	MCS(2500, 927, t) ;craft 
	sleep, 100 
	MCS(2233, 534, t) ;
	MCS(2233, 534, t) ;craft
	MCS(2433, 564, t) ;D
	
	MCS(2500, 602, t) ;
	MCS(2254, 684, t) ;
	MCS(2324, 676, t) ;
	MCS(2378, 673, t) ;
	MCS(2426, 674, t) ;
	MCS(2495, 677, t) ;
	
	MCS(2459, 563, t) ;C
	MCS(2459, 563, t) ;C
	MCS(2489, 600, t) ;
	MCS(2245, 679, t) ;
	MCS(2314, 668, t) ;
	MCS(2382, 672, t) ;
	
	
	MCS(2486, 564, t) ;B
	MCS(2486, 564, t) ;B
	MCS(2494, 677, t) ;
	MCS(2428, 673, t) ;
	MCS(2239, 681, t) ;
	MCS(2433, 605, t) ;
	MCS(2369, 597, t) ;
	MCS(2298, 609, t) ;
	MCS(2236, 608, t) ;
	
	
	MCS(2325, 927, t) ;skill 
	sleep, 100 
	MCS(2314, 830, t) ;warrior 
	sleep, 100 
	MCS(2252, 771, t) ;shield attack 
	MCS(2835, 883, t) ;slot 1
	MCS(2398, 719, t) ;fan swing 
	MCS(2874, 890, t) ;slot 2 
	MCS(2319, 893, t) ;angel 
	sleep, 100
	MCS(2400, 715, t) ;speed 
	MCS(2910, 887, t) ;slot 3 
	MCS(2247, 777, t) ;gold 
	MCS(2834, 926, t) ;slot 4
	MCS(2326, 860, t) ;wizard 
	sleep, 100 
	
	MCS(2245, 620, t) ;firestorm 
	MCS(2633, 886, t) ;slot 1 
	
	MCS(2405, 567, t) ;fireball 
	MCS(2675, 883, t) ;slot 2 
	MCS(2252, 772, t) ;double thunder ball 
	MCS(2714, 887, t) ;slot 3 
	MCS(2247, 719, t) ;blizzard
	MCS(2633, 931, t) ;slot 4 
	MCS(2402, 721, t) ;thunder ball 
	MCS(2674, 922, t) ;slot 5 
	
	
	;MCS(2325, 927, t) ;skill 
	;sleep, 100 
	;MCS(2327, 897, t) ;angel 
	;sleep, 100 
	;MCS(2400, 715, t) ;speed 
	;MCS(2910, 887, t) ;slot 3 
	;MCS(2247, 777, t) ;gold 
	;MCS(2834, 926, t) ;slot 4
	;MCS(2311, 863, t) ;wizard 
	;sleep, 100 
	;MCS(2252, 772, t) ;double thunder ball 
	;MCS(2835, 883, t) ;slot 1
	;MCS(2247, 719, t) ;blizzard
	;MCS(2874, 890, t) ;slot 2 
	;MCS(2318, 835, t) ;warrior 
	;sleep, 100 
	;
	;MCS(2246, 771, t) ;shield attack 
	;MCS(2633, 886, t) ;slot 1 
	;MCS(2401, 713, t) ;fan swing 
	;MCS(2675, 883, t) ;slot 2 
	;MCS(2405, 557, t) ;slash 
	;MCS(2714, 887, t) ;slot 3 
	;MCS(2633, 931, t) ;slot 4 
	;MCS(2674, 922, t) ;slot 5 
	
	
	MCS(2238, 928, t) ;upgrade 
	sleep, 100 
	MCS(2251, 882, t) ;nitro on 
	
	loop, 10 {
		MCS(2355, 732, t) ;1-1
		MCS(2358, 768, t) ;2-1
		MCS(2360, 809, t) ;3-1
		sleep, 1000
	}
	
	
	while(!GetKeyState("Left")  && z < 850) {
		z++
		if(z > 150) {
			checkNitroOnUpgrade()
			sleep, 100
		}
		checkUpgrades()
		Tooltip, %z%, 2007, 749
	}
	
	
	MCS(2501, 945, t) ;system 
	sleep, 100 
	clickOn(2227, 681, 2231, 685, 0xFFF0C1) ;autoprogress off
	sleep, 100 
	
	MCS(2416, 929, t) ;explore
	sleep, 100 
	MCS(2404, 561, t) ;4 
	sleep, 100 
	loop, 3 {
		MCS(2350, 699, t) ;4-7
		sleep, 500 
	}
	
	MCS(2242, 926, t) ;upgrade 
	sleep 100 
	
	loop, 30 {
		MCS(2355, 732, t) ;1-1
		MCS(2358, 768, t) ;2-1
		MCS(2360, 809, t) ;3-1
		sleep, 200
	}
	
	z := 0 
	while(!GetKeyState("Left")  && z < 600) {
		z++
		checkNitroOnUpgrade()
		sleep, 100
		checkUpgrades()
		Tooltip, 2:%z%, 2007, 749
	}
	
	MCS(2408, 885, t) ;slime bank 
	sleep, 100
	MCS(2437, 772, t) ;cap 
	sleep, 100
	MCS(2484, 532, t) ;go back 
	sleep, 100
	

	;if(colorIsVisibleQuick(2325, 876, 0x0078D5)) {
	;	if(z > 250) {
	;		MCS(2243, 949, t) ;craft 
	;		sleep, 100 
	;		MCS(2240, 850, t) ;use first 
	;		MCS(2507, 928, t) ;challenge
	;		sleep, 100 
	;	}
	;	
	;	MCS(2306, 880, t) ;start
	;	z := 0
	;} else {
	;	z++
	;}
	;Tooltip, %z%, 2007, 749

;}

return 


!0::
CoordMode, Mouse, Screen
CoordMode, Pixel, Screen
CoordMode, Tooltip, Screen
t := 150
z := 0

while(!GetKeyState("Left")) {
	z++
	checkNitroOnUpgrade()
	checkUpgrades()
	Tooltip, %z%, 2007, 749
}


return 

checkUpgrades() {
	global t
	
	clickOn(2230, 840, 2239, 850, 0x01FFFF) ;gold 
	clickOn(2358, 849, 2363, 855, 0xB5B6FF) ;ore ritual 
	clickOn(2398, 848, 2402, 854, 0x7788FF) ;c ritual 
	clickOn(2435, 848, 2440, 855, 0x0E0FE8) ;l ritual 
	
	clickOn(2381, 732, 2386, 738, 0x89BBBB) ;1-2 
	clickOn(2390, 776, 2396, 781, 0xADFFF7) ;2-2 
	clickOn(2388, 805, 2393, 810, 0x007D00) ;3-2 
	clickOn(2420, 733, 2426, 739, 0x79A5A6) ;3-3
	clickOn(2428, 776, 2433, 781, 0xBCFFFD) ;2-3 
	clickOn(2427, 805, 2432, 811, 0x007D00) ;3-3 
	clickOn(2464, 732, 2469, 738, 0xAAD4D3) ;3-4 
	clickOn(2469, 769, 2474, 774, 0xD1D1D1) ;2-4 
	clickOn(2469, 799, 2477, 805, 0x6C9695) ;3-4

}


































































































































































	
	
	
	
	
	
	
	
	
	
	
	


;Used by pressing alt ` it writes in notepad++
;the function to click at that spot
!`::
CoordMode, Mouse, Screen
CoordMode, Pixel, Screen
CoordMode, Tooltip, Screen
MouseGetPos, xpos, ypos
WinGetTitle, Title, A
StringGetPos, pos, Title, Notepad++
if(pos < 0)
	MCSH(422, 1059, 100) ;notepad++ icon
Send {Enter}MCS(%xpos%, %ypos%, t){Space}{;}
MouseMove, xpos, ypos, 0
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