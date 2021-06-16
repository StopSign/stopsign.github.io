cpNames:=["menu1","menu2","menu3","menu4","menu5","menu6","menu7","menu8","explore","explore_map1","explore_map2","explore_map3","explore_map4","explore_map5","explore_map6","explore_map7","explore_map8","explore_area1","explore_area2","explore_area3","explore_area4","explore_area5","explore_area6","explore_area7","explore_area8","explore_dungeon1","explore_dungeon2","explore_dungeon3","explore_dungeon4","explore_dungeon5","explore_bestiary","bestiary_lootAll","bestiary_close","upgrade","upgrade_mining1","upgrade_mining2","upgrade_mining3","upgrade_synt1","upgrade_synt2","upgrade_synt3","upgrade_gathering1","upgrade_gathering2","upgrade_gathering3","upgrade_pickaxe1","upgrade_pickaxe2","upgrade_pickaxe3","upgrade_pickaxe4","upgrade_lab1","upgrade_lab2","upgrade_lab3","upgrade_lab4","upgrade_rake1","upgrade_rake2","upgrade_rake3","upgrade_rake4","upgrade_gold_bonus","upgrade_exp_bonus","upgrade_expand_equip","upgrade_stone_ritual","upgrade_crystal_ritual","upgrade_leaf_ritual","upgrade_mystery_box","upgrade_8","upgrade_16","upgrade_24","upgrade_32","upgrade_upgrade1","upgrade_upgrade10","upgrade_upgrade25","upgrade_upgradeMax","upgrade_nitro","upgrade_nitro_pixel_start","upgrade_nitro_pixel_end","upgrade_slime_bank","upgrade_dark_ritual","sb_GoBack","sb_withdraw","sb_withdrawConfirm","sb_times1","sb_times10","sb_times25","sb_timesMax","sb_donate","sb_purifucation","sb_efficiency","sb_exchange","sb_interest","sb_cap","sb_et_stone","sb_et_crystal","sb_et_leaf","sb_strength","sb_mind","sb_healty_captue","sb_enhanced_capture","sb_monster_counter","sb_graduates","sb_ledger","sb_nitro_generators","sb_18","sb_19","sb_20","sb_21","sb_22","sb_23","sb_24","sb_25","sb_26","sb_27","sb_28","sb_29","sb_30","sb_31","sb_32","craft_equip_d_toggle","craft_equip_c_toggle","craft_equip_b_toggle","craft_equip1_level_button","craft_equip2_level_button","craft_equip3_level_button","craft_equip4_level_button","craft_equip5_level_button","craft_equip6_level_button","craft_equip7_level_button","craft_equip8_level_button","craft_craft_confirm_Box","craft_Alchemy_confirm_Box","craft_inventory_confirm_Box","alchemy_size_1ml","alchemy_size_10ml","alchemy_size_100ml","alchemy_size_1L","alchemy_size_10L","alchemy_size_100L","alchemy_size_1kL","alchemy_size_10kL","alchemy_size_100kL","alchemy_size_1mill","alchemy_size_10mill","alchemy_size_100mill","alchemy_size_1BL","alchemy_size_10BL","alchemy_auto","alchemy_plus_button","alchemy_use_all","alchemy_potion_option_1","alchemy_potion_option_2","alchemy_potion_option_3","alchemy_potion_option_4","alchemy_potion_option_5","alchemy_potion_option_6","alchemy_potion_option_7","alchemy_potion_option_8","alchemy_potion_option_9","alchemy_potion_option_10","alchemy_potion_option_11","alchemy_potion_option_12","alchemy_potion_option_13","alchemy_potion_option_14","alchemy_potion_option_15","alchemy_potion_option_16","alchemy_potion_inventory_slot_1","alchemy_potion_inventory_slot_2","alchemy_potion_inventory_slot_3","alchemy_potion_inventory_slot_4","alchemy_potion_inventory_slot_5","alchemy_potion_inventory_slot_6","alchemy_potion_inventory_slot_7","alchemy_potion_inventory_slot_8","alchemy_potion_inventory_slot_9","alchemy_potion_inventory_slot_10","alchemy_potion_inventory_slot_11","alchemy_potion_inventory_slot_12","alchemy_potion_inventory_slot_13","alchemy_potion_inventory_slot_14","alchemy_potion_inventory_slot_15","alchemy_potion_inventory_slot_16","challenge_1","challenge_2","challenge_3","challenge_4","challenge_5","challenge_retryBox","challenge_start","challenge_quit","skill_table_warrior","skill_table_wizard","skill_table_angel","skill_table_skill_1","skill_table_skill_2","skill_table_skill_3","skill_table_skill_4","skill_table_skill_5","skill_table_skill_6","skill_table_skill_7","skill_table_skill_8","skill_table_skill_9","skill_table_skill_10","skill_table_skill_1_stance","skill_table_skill_2_stance","skill_table_skill_3_stance","skill_table_skill_4_stance","skill_table_skill_5_stance","skill_table_skill_6_stance","skill_table_skill_7_stance","skill_table_skill_8_stance","skill_table_skill_9_stance","skill_table_skill_10_stance","skill_table_skill_1_chargeUp","skill_table_skill_2_chargeUp","skill_table_skill_3_chargeUp","skill_table_skill_4_chargeUp","skill_table_skill_5_chargeUp","skill_table_skill_6_chargeUp","skill_table_skill_7_chargeUp","skill_table_skill_8_chargeUp","skill_table_skill_9_chargeUp","skill_table_skill_10_chargeUp","skillbar_class_top_1","skillbar_class_top_2","skillbar_class_top_3","skillbar_class_bottom_1","skillbar_class_bottom_2","skillbar_class_bottom_3","skillbar_global_top_1","skillbar_global_top_2","skillbar_global_top_3","skillbar_global_bottom_1","skillbar_global_bottom_2","skillbar_global_bottom_3","skillbar_active_skill","skillbar_automove"]

#NoEnv
SetBatchLines, -1
Thread, NoTimers
CoordMode, ToolTip
SetTitleMatchMode, 2
DetectHiddenWindows, On


global debug:=0
global begin_x, begin_y, end_x, end_y
global gameX,gameY
global startTime:=A_now

loadClickPoints()

While mapGameContainer() 
{
	if (A_now-startTime > 10)
	{
		MsgBox Click the game window then press Alt + F1 to start
		break
	}
}



!F1::
	mapGameContainer()
	return
	
!F2::
	showGameContainer()
	return

Escape::
	ExitApp
	Return	
	
!1:: 
gClick(upgrade_nitro_pixel_start.x, upgrade_nitro_pixel_start.y)
return
	
	
	
mapGameContainer()
{
	WinGetPos, xZero, yZero, winWidth, winHeight, A
	mid:=winHeight*0.5
	
	PixelSearch, begin_x, temp, 0, %mid%, %winWidth%, %mid%, 0xB5B5B5, 3, Fast
	if ErrorLevel {
		return 1
	}

	;find top left
	PixelSearch, begin_x, begin_y, %begin_x%, %mid%, %begin_x%, 0, 0x000000, 0, Fast
	if ErrorLevel {
		return 1
	}
	begin_y:=begin_y+1
	

	;find top right
	PixelSearch, end_x, begin_y, %begin_x%, %begin_y%, %winWidth%, begin_y, 0x000000, 0, Fast
	if ErrorLevel {
		return 1
	}
	end_x:=end_x-1
	
	
	PixelSearch, end_x, end_y, %end_x%, %begin_y%, %end_x%, winHeight, 0x000000, 0, Fast
	if ErrorLevel {
		return 1
	}
	end_y:=end_y-1
	
	gameX:=Abs(begin_x-end_x)
	gameY:=Abs(begin_y-end_y)
	
	showGameContainer()
	return 0
}

showGameContainer()
{
	mousemove, begin_x,begin_y,0
	mousemove, end_x,begin_y,0
	mousemove, end_x,end_y,0
	mousemove, begin_x,end_y,0
	mousemove, begin_x,begin_y,0
	return
}


loadClickPoints()
{
	clickPoints := {}
	Loop, read, offsets.txt
	{
		Loop, parse, A_LoopReadLine, %A_Tab%
		{
			
			Switch A_Index
			{
				Case "1":
					 name:= A_LoopField
					
				Case "2":
					 x:= A_LoopField
					
				Case "3":
					 y:= A_LoopField
					
				Default:							
			}
		}
		
		;Msgbox, % name " X="%name%.x "Y="%name%.y
		%name% :=new ClickPoint(name,x,y)
		clickPoints.insert(name, {name:name, x:x, y:y})
	}
	return
}

class ClickPoint
{
	name := none
	x:=0
	y:=0
	
	__New(aname,ax,ay)
	{
		this.name:=aname
		this.x:=ax
		this.y:=ay
	}
}

;calcualtes games clickpoint cords with respect to the clients resolution
;prob dont needs move and click but...
gClick(XPos,YPos)
{
	global gameX,gameY
	gameClickX := (gameX * XPos)+begin_x
	gameClickY := (gameY * Ypos)+begin_Y
	
	;MsgBox, %XPos%, %Ypos%
	
	mousemove, gameClickX, gameClickY
	sleep, 10
	click, L,gameClickX, gameClickY
	sleep, 10
	return
}