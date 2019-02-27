let tutorial = [
    [ //0
        "Welcome to King's Perfect War! Please follow the tutorial exactly to understand the base mechanics.<br>" +
        "Your goal is to beat all hideouts in the map in order to unlock the next map.<br>" +
        "The map resets if your king dies or you run out of mana.<br>" +
        "When the map resets, all lists will start over and your resources will be set to the level's default values.",
        "Click on the dungeon (closer to your castle) and press Add Action in the Info Box. An action to move your king to the first hideout is created and added to the Units list.<br>" +
        "You can also right click an action to select it AND add it to the list. Save a click!<br>" +
        "Press Play to start the timer running!"
    ],
    [ //1
        "The game has paused automatically because the Units list has finished, sending the King to the enemy dungeon.<br>" +
        "Press Play again until the king has slain the troll, and the game will pause again."
    ],
    [ //2
        "The reward for clearing the dungeon is gold, wood, and mana, which has unlocked some buildings. Use your gold on Hire Beggar once and then Scavenger's Den once.<br>" +
        "Then Play until they're built (and the game pauses because Castle list is complete)."
    ],
    [ //3
        "Great! That's the basics of income. Now that you have some resources flowing, it's time to get units.",
        "Each unit has a production facility, which is required to build the unit.<br>" +
        "Having one barracks when you build a spearman means you build one spearman for 200 wood in one action.<br>" +
        "Having two barracks when you build a spearman means you build two spearman for 400 wood in one action.",
        "Add the sleep action 10 times to let resources build, then build one barracks and two spearman.<br>" +
        "Be careful, as the the game won't pause if the last action on a list is sleeping.",
        "In addition, you'll want your king to fight with your units, so send him back to your castle."
    ],
    [ //4
        "Now that you have the units, it's time to send them off!<br>" +
        "Change which units get selected for a move order by ensuring they're highlighted in the bottom right corner of War Map when you add the action. All units of those types will immediately head toward the destination when the action finishes.",
        "Select both King and Units and send them all to the hideout, to clear out the thugs."
    ],
    [ //5
        "Great! You've cleared the map. Move on to the next one to continue."
    ],
    [ //6
        "As King, you can inspire workers to work harder... as long as you're there. Use the unlocked Auras to give the extra boost needed to win this level!",
        "There are many ways to win the levels from here on out, but to start you should" +
        "<ul><li>Enable the Oversee Market Aura</li>" +
        "<li>Hire a first Beggar</li>" +
        "<li>Sleep 5 seconds</li>" +
        "<li>Hire a second Beggar</li>" +
        "<li>Get two Scavengers</li>" +
        "</ul>"
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