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
    [
        "story1"
    ],
    [
        "story2"
    ]
];

let divText = "";
for(let i = 0; i < story.length; i++) {
    divText += "<div id='pageNum"+i+"' style='display:none'>"+story[i]+"</div>"
}
document.getElementById("storyContainer").innerHTML = divText;