let tutorial = [
    [ //0
        "Welcome to King's Perfect War! The first few levels are meant to familiarize you with the game.<br>" +
        "Your goal is to beat all hideouts in the map (for this map there's only the 1), in order to unlock the next map.<br>",
        "The map resets if you press the reset button, your mana runs out (for this map you have "+levelInitials[0].initial.mana+" mana), your king dies, or an enemy unit is in your castle with no defenders.<br>" +
        "When the map resets, all lists will start over and your resources will be set to the level's default values.",
        "Click on the enemy's hideout and press Add Action in the Info Box. An action to move your king to the first hideout is created and added to the Units list.<br>" +
        "You can also right click an action to select it AND add it to the list. Save a click!<br>" +
        "Press Play to start the timer running!"
    ],
    [ //1
        "The game has paused automatically. With default settings, pausing will occur when:<br>" +
        "<ul><li>A list has completed a non-sleep action and has no actions remaining.</li>" +
        "<li>A place (hideout, dungeon, castle) is cleared of all enemies</li>" +
        "<li>The map is about to restart</li></ul><br>" +
        "Not to worry about all the wasted time - you will get bonus ticks at 80% efficiency when the game is paused (or offline).",
        "Now that you've sent your king to the enemy hideout, go ahead and Play (until the game pauses automatically when you've cleared the hideout)<br>"
    ],
    [ //2
        "Each enemy killed gives you EXP, which helps you level up. In addition, the dungeon this time had a unique reward of 200 exp - enough to get a level! Unique rewards can only be received once, even after resetting the map.<br>" +
        "Leveling up increases your Reflex Cap by 2. You'll use this in the next map. At the top of the War Map, an arrow has appeared to bring you to the next town. Click it now."
    ],
    [ //3
        "This map's first hideout has one more Thug - you won't be able to kill it as you are now. Use the new Train action 11 times (enough to get >10.2 RFLX) and then take down the first hideout.<br>" +
        "Remember, you can rely on pausing when actions are completed to plan your next step."
    ],
    [ //4
        "You've gained some gold and wood from that battle, enough to build some units! Build a barracks and two spearmen to take out the last hideout. You can also order the King unit to come back home, so they can leave with the new spearmen.<br>" +
        "Change which units get selected for a move order by ensuring they're highlighted when you add the action. All units of those types will immediately head toward the destination when the action finishes."
    ],
    [ //5
        "Great! You've cleared the map. Move on to the next one to continue."
    ],
    [ //6
        "This map has a dungeon! Dungeons aren't required to beat the map, but often give important resources needed to win."
    ]
];

let story = [
    [ //0
        "Day 4<br><br>" +
        "I'm starting a journal, using the royal magic of taking magical notes and storing them in my soul. This might the first time I've used it. Anyways...<br><br>" +
        "I'm trapped; this is hell. \"This weapon can save everyone!\" they said, \"Only the king can use it!\" Next time I come back I think I might stab my advisor in the face when he berates me for not personally slaying the monsters. I am King! I have others to get their hands dirty in my place. No matter how I tell him, the fool doesn't accept the reality in front of his face.<br><br>"+
        "Death by mana exhaustion is painful. I need to find a better way."
    ],
    [ //1
        "Day 5<br><br>" +
        "Death by stabbing is painful. Will my advisor whimper as much as I, when I hand him an equal sentence?<br><br>" +
        "... Am I being corrupted by the resets? Is that the purpose of all this - creating a demon king? Why won't anyone give me clear direction!"
    ],
    [ //2
        "Day 6<br><br>" +
        "When I jump to my death, I should remember to land head first. Well, I doubt I'll forget; death by Mana Exhaustion AND broken legs was a bit much<br><br>" +
        "I think I'll rest for these precious few painless hours."
    ],
    [ //3
        "Day 10<br><br>" +
        "Hrongar. Hrongar! The edge of the world! Well, the edge that no one cares about at least. This town can offer me nothing. No men capable of fighting, no women worth seducing, no conversation worth having. These savages can't even find me a poison to painlessly die.<br><br>" +
        "If this place didn't hold the sigil to initiate these... repetitions... I would have never come here."
    ],
    [ //4
        "Day... 15?<br><br>" +
        "Mana Exhaustion ishn't sho bad when I'm drunk. The wine here sucks."
    ],
    [ //5
        "Day I don't care anymore<br><br>" +
        "I've figured out how to send my advisor away with only a short conversation. It's a welcome relief. I've taken to picking up all the liquor I can hold and wandering the wilderness."
    ],
    [ //6
        "Come to think of it, the magical note royal magic probably only exists for this purpose. Maybe I've been raised for it since birth in other ways, but if so I'm not sure how all the parties and fancy duels helped. Maybe time will tell, and I'll have to seduce the final boss to get out of this endless nightmare.<br><br>" +
        "Ah, I am so brilliant! The blood of royalty is truly outstanding. I should ask my advisor what he knows of this phenomenon."
    ],
    [ //7
        "The sniveling idiot! He knew this whole time! My goal is simple: Activate the nearby power sigil, and according to texts it stays activated even as the rest of the world resets. This is it! My nightmare is nearly ended"
    ],
    [ //8
        "... Unfortunately, convincing the population to attack the bandit hideout to save the kingdom doesn't work. Ungrateful peasants...<br><br>" +
        "Addendum: ordering the bandits to leave in the name of the King is just as ineffective. Who do they think mowns this land? It is a shame killing doesn't stick."
    ],
    [ //9
        "Day 100<br><br>" +
        "Today is the day. I have scouted 10 thugs, and have learned their patrol routes. Today I will kill them all, and end this nightmare!"
    ],

];

let divText = "";
for(let i = 0; i < story.length; i++) {
    divText += "<div id='pageNum"+i+"' style='display:none'>"+story[i]+"</div>"
}
document.getElementById("storyContainer").innerHTML = divText;