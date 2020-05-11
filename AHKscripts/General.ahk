
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
	MCS(2895, 880, t) ;global slot 3 
	MCS(2405, 623, t) ;god bless
	MCS(2895, 880, t) ;global slot 3 
	MCS(2249, 720, t) ;protect
	MCS(2895, 880, t) ;global slot 3 
	MCS(2399, 721, t) ;haste
	MCS(2895, 880, t) ;global slot 3 
	MCS(2252, 774, t) ;gold
	MCS(2895, 880, t) ;global slot 3 
	;MCS(2399, 773, t) ;skill
	;MCS(2895, 880, t) ;global slot 3 
	MCS(2403, 664, t) ;magic
	MCS(2895, 880, t) ;global slot 3 
	
	


	;MCS(2329, 831, t) ;warrior
	;sleep, 100
	;MCS(2249, 774, t) ;shield attack 
	
	;MCS(2243, 566, t) ;wing attack 
	;MCS(2408, 572, t) ;wing shoot 
	
	MCS(2244, 626, t) ;heal

	MCS(2895, 880, t) ;global slot 3 
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

MCS(316, 648, t) ;water
while(!GetKeyState("Left")) {
	Send m 
	sleep, 50 
	Send u 
	sleep, 50 
}

return




!6::

CoordMode, Mouse, Screen
CoordMode, Pixel, Screen
CoordMode, Tooltip, Screen
t := 100
z := 0
x := 0 

MCS(581, 891, t) ;challenge
sleep, 100 


;doUpgrades()
while(!GetKeyState("Left")) {
	if(colorIsVisibleQuick(406, 841, 0x20A7D3)) {
		if(z > 150) {
			MCS(322, 912, t) ;craft 
			sleep, 100 
			MCS(500, 526, t) ;10L
			sleep, 100 
			if(colorIsNotVisibleQuick(311, 807, 0x98D6D6)) {
				;MCS(311, 660, t) ;craft golem tincture 
				;MCS(364, 662, t) ;deathpider tincture 
				MCS(408, 664, t) ;fairy tincture 
			}
			MCS(320, 815, t) ;use
			;doUpgrades()
			MCS(581, 891, t) ;challenge
			sleep, 100 
		}
		MCS(378, 841, t) ;start
		safeSpot()
		z := 0
	} else {
		z++
	}
	Tooltip, %z%, 87, 611

}

return


; include path/gicon2 
; viconNmw:= new gIcon("offImageName",760,830,"scriptLabel")


!7::
CoordMode, Mouse, Screen
CoordMode, Pixel, Screen
CoordMode, Tooltip, Screen
t := 150
z := 9999 

while(!GetKeyState("Left")) {
	;if(rClickOn(636, 472, 1063, 609, 0x00C339)) { ;green spider 
	;if(rClickOn(636, 472, 1063, 609, 0x00B5AA)) { ;yellow spider 
	;if(rClickOn(636, 472, 1063, 609, 0xAB0025)) { ;blue spider 
	;if(rClickOn(636, 472, 1063, 609, 0x000087)) { ;red spider 
	if(rClickOn(636, 472, 1063, 609, 0x650B4B)) { ;normal spider 
	;if(rClickOn(636, 472, 1063, 609, 0x63B2FF)) { ;orange fox 
	;if(rClickOn(636, 472, 1063, 609, 0x7BE7FF)) { ;yellow fox 
	;if(rClickOn(636, 472, 1063, 609, 0xB5DB7B)) { ;green fox 
	;if(rClickOn(636, 440, 1063, 587, 0xFFFFFF)) { ;white fox 
	;if(rClickOn(636, 472, 1063, 609, 0x546725)) { ;green faerie 
	;if(rClickOn(636, 472, 1063, 609, 0x00A2E7)) { ;yellow faerie 
	;if(rClickOn(636, 472, 1063, 609, 0xAD2429)) { ;blue faerie 
	;if(rClickOn(636, 472, 1063, 609, 0x6B226C)) { ;purple faerie 
	;if(rClickOn(636, 472, 1063, 609, 0xFF7552)) { ;blue m'slime
	;if(rClickOn(636, 472, 1063, 609, 0x8CFFFF)) { ;yellow m'slime
	;if(rClickOn(636, 472, 1063, 609, 0x6B8AFF)) { ;red bat
	;if(rClickOn(636, 472, 1063, 609, 0x6B8AFF)) { ;red slime
		if(colorIsNotVisibleQuick(314, 844, 0xA1A4A5)) {
			MCS(596, 695, t) ;buy trap 
			safeSpot()
		}
		
	}
	
	
	
	z++
	Tooltip, %z%, 2007, 749
	if(z > 200) {
		MCS(322, 929, t) ;upgrade 
		sleep, 100 
		z := 0 
		MCS(477, 895, t) ;slime bank 
		MCSHR(471, 771, t) ;SC upgrade right click 
		MCSHR(471, 771, t) ;SC upgrade right click 
		
		MCS(573, 527, t) ;go back 
		sleep, 100
	
		;nitro 
		if(checkNitroOnUpgrade()) {
			MCS(320, 949, t) ;craft 
			sleep, 100 
			MCS(456, 560, t) ;1L 
			sleep, 100 
		}
		
		MCS(320, 949, t) ;craft 
		sleep, 100 
	}
	sleep, 10 
	
}


return


checkNitroOnUpgrade() {
	global t
	if(colorIsVisibleQuick(390, 895, 0x000042)) { 
		
		MCS(323, 950, t) ;craft 
		sleep, 100 
		MCS(404, 531, t) ;alch 
		sleep, 100 
		MCS(309, 558, t) ;1ml
		sleep, 100 
		MCS(499, 651, t) ;nitro gen 
		Send mm
		sleep, 100F
		MCS(579, 821, t) ;use all 
		
		MCS(323, 929, t) ;upgrade 
		sleep, 100 
		return 1 
	}
}



;farm white fox 
!8::
CoordMode, Mouse, Screen
CoordMode, Pixel, Screen
CoordMode, Tooltip, Screen
t := 100 

MCS(2413, 929, t) ;explore 
sleep, 200 
MCS(2247, 585, t) ;5 
sleep, 100 
Send {a down} 
sleep, 300 
Send { a up} 
MCS(2401, 648, t) ;5-4 

while(!GetKeyState("Left")) {
	MCS(2401, 648, 500) ;5-4 
}


return 


;capture white fox 
;!8::
CoordMode, Mouse, Screen
CoordMode, Pixel, Screen
CoordMode, Tooltip, Screen
t := 100 
while(!GetKeyState("Left")) {

	MCSHR(2634, 891, t) ; remove blizzard 
	MCSHR(2868, 887, t) ; remove fan swing 

	MCS(2413, 929, t) ;explore 
	sleep, 200 
	MCS(2247, 585, t) ;5 
	sleep, 100 
	Send {a down} 
	sleep, 300 
	Send { a up} 
	MCS(2401, 648, t) ;5-4 

	MCS(2261, 950, t) ;click craft 
	sleep, 100 
	MCS(2372, 559, t) ;1L
	sleep, 100 
	while(clickOn(2503, 689, 2510, 695, 0xA5A9A9) && !GetKeyState("left")) {
		MouseMove, 2768, 703, 0 
		Sleep, 50 
		loop, 3 {
			MCSHR(2768, 703, 50)
		}
		MCS(2413, 929, t) ;explore 
		sleep, 200 
		MCS(2401, 648, t) ;5-4 
		MCS(2261, 950, t) ;click craft 
		sleep, 100 
		sleep, 200
	}

	MCS(2413, 929, t) ;explore 
	sleep, 200 
	MCS(2403, 558, t) ;4 
	sleep, 100 
	MCS(2304, 655, t) ;4-2

	MCS(2624, 838, t) ;auto move 

	MCS(2328, 925, t) ;skill table 
	sleep, 100 
	MCS(2317, 830, t) ;warrior 
	sleep, 100 
	MCS(2405, 718, t) ;fan swing 
	MCS(2873, 893, t) ;gslot 2 
	MCS(2298, 865, t) ;wizard 
	sleep, 100 
	MCS(2248, 715, t) ;blizzard 
	MCS(2634, 887, t) ;slot 1 

	sleep, 25000
}


return 


setupGearAfterRebirth() {
	global t 
	MCS(578, 930, t) ;craft 
	sleep, 100 
	MCS(578, 930, t) ;craft 
	MCS(511, 564, t) ;D
	
	MCS(576, 607, t) ;
	MCS(329, 675, t) ;
	MCS(397, 680, t) ;
	MCS(510, 676, t) ;
	MCS(577, 682, t) ;
	MCS(458, 677, t) ;
	MCS(511, 681, t) ;
	sleep, 100
	
	MCS(538, 563, t) ;C
	MCS(538, 563, t) ;C
	MCS(517, 605, t) ;
	MCS(579, 606, t) ;
	MCS(333, 677, t) ;
	MCS(387, 680, t) ;
	MCS(576, 681, t) ;
	MCS(579, 683, t) ;
	sleep, 100
	
	MCS(565, 563, t) ;B
	MCS(565, 564, t) ;B
	MCS(331, 608, t) ;
	MCS(389, 602, t) ;
	MCS(454, 610, t) ;
	MCS(517, 611, t) ;
	MCS(329, 674, t) ;
	MCS(509, 673, t) ;
	MCS(573, 678, t) ;
	MCS(516, 681, t) ;
}

setupSkillsForWarrior() {
	global t
	MCS(395, 927, t) ;skill 
	sleep, 100 
	MCS(399, 897, t) ;angel 
	sleep, 100 
	MCS(482, 720, t) ;speed 
	MCS(974, 887, t) ;slot 3 
	MCS(328, 773, t) ;gold 
	MCS(1009, 884, t) ;slot 4
	MCS(325, 676, t) ;muscle 
	MCS(907, 915, t) ;slot 5 
	MCS(476, 620, t) ;god bless 
	MCS(942, 916, t) ;slot 6 
	MCS(389, 865, t) ;wizard 
	sleep, 100 
	MCS(324, 778, t) ;double thunder ball 
	MCS(910, 885, t) ;slot 1
	MCS(327, 722, t) ;blizzard
	MCS(942, 884, t) ;slot 2 
	MCS(383, 832, t) ;warrior 
	sleep, 100 
	
	MCS(331, 780, t) ;shield attack 
	MCS(713, 887, t) ;slot 1 
	MCS(479, 722, t) ;fan swing 
	MCS(753, 889, t) ;slot 2 
	MCS(479, 567, t) ;slash 
	MCS(789, 891, t) ;slot 3 
	MCS(337, 718, t) ;charge swing 
	MCS(709, 932, t) ;slot 4
}

setupSkillsForWizard() {
	global t
	MCS(406, 930, t) ;skill 
	sleep, 100 
	MCS(383, 834, t) ;warrior 
	sleep, 100 
	MCS(331, 780, t) ;shield attack 
	MCS(910, 885, t) ;slot 1
	MCS(479, 722, t) ;fan swing 
	MCS(942, 884, t) ;slot 2 
	MCS(337, 718, t) ;charge swing 
	MCS(1009, 884, t) ;slot 4
	
	MCS(399, 897, t) ;angel 
	sleep, 100
	MCS(482, 720, t) ;speed 
	MCS(974, 887, t) ;slot 3 
	MCS(325, 676, t) ;muscle 
	MCS(907, 915, t) ;slot 5 
	MCS(476, 620, t) ;god bless 
	MCS(942, 916, t) ;slot 6 
	MCS(389, 865, t) ;wizard 
	sleep, 100 
	
	MCS(330, 626, t) ;firestorm 
	MCS(713, 887, t) ;slot 1 
	
	MCS(485, 571, t) ;fireball 
	MCS(753, 889, t) ;slot 2 
	MCS(324, 778, t) ;double thunder ball 
	MCS(789, 891, t) ;slot 3 
	MCS(327, 722, t) ;blizzard
	MCS(709, 932, t) ;slot 4
	MCS(483, 772, t) ;lightning thunder 
	MCS(755, 929, t) ;slot 5 
	MCS(591, 567, t) ;fire stance on 
}

setupSkillsForAngel() {
	global t
	MCS(395, 927, t) ;skill 
	sleep, 100 
	MCS(389, 865, t) ;wizard 
	sleep, 100 
	MCS(483, 772, t) ;lightning thunder 
	MCS(910, 885, t) ;gslot 1
	MCS(327, 722, t) ;blizzard
	MCS(942, 884, t) ;gslot 2 
	MCS(324, 778, t) ;double thunder ball 
	MCS(974, 887, t) ;gslot 3 
	MCS(383, 834, t) ;warrior 
	sleep, 100 
	MCS(331, 780, t) ;shield attack 
	MCS(1009, 884, t) ;gslot 4
	MCS(479, 722, t) ;fan swing 
	MCS(907, 915, t) ;gslot 5 
	MCS(337, 718, t) ;charge swing 
	MCS(942, 916, t) ;gslot 6 
	sleep, 100 
	
	MCS(399, 897, t) ;angel 
	sleep, 100 
	MCS(482, 720, t) ;speed 
	MCS(713, 887, t) ;slot 1 
	MCS(328, 773, t) ;gold 
	MCS(753, 889, t) ;slot 2 
	MCS(325, 676, t) ;muscle 
	MCS(789, 891, t) ;slot 3 
	MCS(476, 620, t) ;god bless 
	MCS(709, 932, t) ;slot 4
	MCS(483, 669, t) ;magic 
	MCS(749, 924, t) ;slot 5

}

!9::
CoordMode, Mouse, Screen
CoordMode, Pixel, Screen
CoordMode, Tooltip, Screen
t := 100
rebirthType := 2 ;0-warrior, 1-wizard, 2-angel 


while(!GetKeyState("Left")) {

	MCS(573, 948, t) ;system 
	sleep, 100 
	clickOn(308, 664, 311, 668, 0x202020) ;autoprogress on 
	sleep, 100 
	if(colorIsNotVisible(694, 846, 696, 851, 0xFFFFFF)) {
		MCS(699, 842, t) ;automove on 
	}
	
	MCS(500, 950, t) ;rebirth
	sleep, 100 
	if(rebirthType == 0) {
		MCS(380, 559, t) ;warrior
	} else if(rebirthType == 1) {
		MCS(371, 588, t) ;wizard
	} else {
		MCS(376, 615, t) ;angel
	}
	sleep, 100 
	MCS(413, 902, t) ;rebirth 
	sleep, 300 
	MCS(675, 834, t) ;OK
	sleep, 4000 
	MCS(675, 834, t) ;OK
	sleep, 4000 
	
	
	MCS(321, 927, t) ;upgrade 
	sleep, 100 
	MCS(331, 880, t) ;nitro on 
	
	setupGearAfterRebirth()
	if(rebirthType == 0) {
		setupSkillsForWarrior()
	} else if(rebirthType == 1) {
		setupSkillsForWizard()
	} else {
		setupSkillsForAngel()
	}
	
	
	MCS(321, 927, t) ;upgrade 
	sleep, 100 
	MCS(488, 889, t) ;slime bank 
	sleep, 100 
	MCSHR(474, 771, t) ;SC cap 
	
	MCS(571, 529, t) ;go back 
	sleep, 100
	
	loop, 10 {
		MCS(430, 733, t) ;1-1
		MCS(431, 769, t) ;2-1
		MCS(433, 811, t) ;3-1
		sleep, 400
	}
	
	z := 0
	while(!GetKeyState("Left")) {
		z++
		checkUpgrades() ;buy things 
		Tooltip, %z%, 64, 693
		if(colorIsVisibleQuick(521, 944, 0x919C9F)) { ;until challenge is available
			break
		}
	}
	
	if(rebirthType == 1) { ;wizard needs extra HP
		sleep, 5000 
		
		MCS(398, 846, t) ;buy equipment
		MCS(398, 846, t) ;
		MCS(321, 951, t) ;craft 
		sleep, 100 
		MCS(395, 680, t) ;equip fox coat 
	}
	
	
	MCS(321, 927, t) ;upgrade 
	sleep, 100 
	checkNitroOnUpgrade()
	
	
	;clickOn(2227, 681, 2231, 685, 0xFFF0C1) ;autoprogress off
	
	MCS(490, 928, t) ;explore
	sleep, 100 
	MCS(380, 563, t) ;2 
	sleep, 100 
	loop, 6 { ;prevent challenge not starting because in result screen
		MCS(325, 649, t) ;2-1
		sleep, 500 
	}
	
	
	
	
	MCS(579, 930, t) ;challenge
	sleep, 100 
	MCS(323, 574, t) ;select slime boss 
	sleep, 100 
	MCS(382, 883, t) ;start 
	sleep, 100 
	
	Send {S down}
	sleep, 500 
	Send {S up}
	
	if(rebirthType == 0 || rebirthType == 2) {
		MCSHR(945, 884, t) ;remove blizzard (gslot 2)
	} else if(rebirthType == 1) { ;slow slimes work better for wizard
		;MCSHR(712, 930, t)
	}
	
	safeSpot()
	loop, 10 {
		if(colorIsVisibleQuick(403, 878, 0x24AAD5)) { ;check if died in challenge to restart it 
			MCS(364, 883, t) ;start
			Send {S down}
			sleep, 500 
			Send {S up}
			MCS(655, 826, t) ;use special attack 
		}
		sleep, 1000
	}
	
	;do more nitro in the middle 
	MCS(321, 927, t) ;upgrade 
	sleep, 100 
	checkNitroOnUpgrade()
	MCS(579, 930, t) ;challenge
	sleep, 100 
	
	loop, 10 {
		if(colorIsVisibleQuick(403, 878, 0x24AAD5)) {
			MCS(364, 883, t) ;start
			Send {S down}
			sleep, 500 
			Send {S up}
			MCS(655, 826, t) ;use special attack 
		}
		sleep, 1000
	}
	
	MCS(321, 927, t) ;upgrade 
	sleep, 100 
	checkNitroOnUpgrade()
	
	MCS(699, 847, t) ;auto move back on 
	Tooltip, 

	rebirthType++ ;cycle between all 3 rebirths 
	if(rebirthType == 3) {
		rebirthType = 0
	}
}

return 


!0::
CoordMode, Mouse, Screen
CoordMode, Pixel, Screen
CoordMode, Tooltip, Screen
t := 50
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
	clickOn(310, 840, 320, 850, 0x01FFFF) ;gold 
	clickOn(438, 849, 443, 855, 0xB5B6FF) ;ore ritual 
	clickOn(478, 848, 482, 854, 0x7788FF) ;c ritual 
	clickOn(515, 848, 520, 855, 0x0E0FE8) ;l ritual 
	
	clickOn(461, 732, 466, 738, 0x89BBBB) ;1-2 
	clickOn(470, 776, 476, 781, 0xADFFF7) ;2-2 
	clickOn(467, 805, 473, 810, 0x007D00) ;3-2 
	clickOn(500, 733, 506, 739, 0x79A5A6) ;3-3
	clickOn(508, 776, 513, 781, 0xBCFFFD) ;2-3 
	clickOn(507, 805, 512, 811, 0x007D00) ;3-3 
	clickOn(544, 732, 549, 738, 0xAAD4D3) ;3-4 
	clickOn(549, 769, 554, 774, 0xD1D1D1) ;2-4 
	clickOn(549, 799, 557, 805, 0x6C9695) ;3-4

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
	MouseMove, 526, 402, 0
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