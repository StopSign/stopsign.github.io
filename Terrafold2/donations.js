window.donations = {
    tick: function() {
        window.donations.checkDonations();
    },
    checkDonations: function() {

        // window.donations.check(0, true, 0, "Loaded game", "Dev", "", ["lakebuilt_0", "lakebuilt_1"]);
        window.donations.check(0, true, 0, "Loaded game", "Dev", "Welcome to Terrafold, an Unfolding game about Terraforming. Click this message to make it disappear.", ["lakebuilt_0", "lakebuilt_1"]);
        window.donations.check(1, true, 1000, "Loaded game", "Dev", "To get started, spend all your cash on buying Ice, then work towards building a Construction Bot");
        window.donations.check(2, res.ore > 0, 50, "Built 1st C.Bot", "carolS43", "Congratulations on your first step in the galaxy, sweetie!! You're gonna do great out there :) :) XOXO -aunt carol");
        window.donations.check(3, res.ore > 0, 0, "First Donation", "Dev", "You'll get donations from your viewers for reaching some milestones. Buy more ice, and make a volcano explode!", ["lakeiron_0"]);
        window.donations.check(4, res.iron > 0, 100, "First Iron", getRandomUsername(), "We iron age now", ["ironContainer", "lakeiron_0", "lakeiron_1", "lakeiron_2", "lakeiron_3", "lakeiron_4"]);
        window.donations.check(5, unique.depth > 0, 100, "First Dig", "BeardsMakesTheMan", "Dig, dig, dig, dig");

        window.donations.check(7, lakes[0].upgrade.generator > 0, 300, "First Upgrade Lake 0", "Yield_Sign", "Stream is interesting, I'll be watching for a while. Here's a starting boost, more to come.");
        window.donations.check(8, res.cbotsMax > 1, 40, "First C.Bot Built", "your_name_here", "Name if after me, pease.");
        window.donations.check(9, res.cbotsMax > 2, 10, "Second C.Bot Built", "your_name_here", "Please*");
        window.donations.check(47, res.cbotsMax > 24, 100, "25 C.Bots", getRandomUsername(), "By the way streamer, if you have more than 50 bots without storage they'll all crash! Have fun :)", ["cbotContainer3"]);
        window.donations.check(10, res.cbotsMax > 41, 420, "42 C.Bots", "xXx420_N0sc0p3", "ayy");

        window.donations.check(12, lakes[1].upgrade.generator > 0, 300, "First Upgrade Lake 1", "Yield_Sign", "I'm impressed by your progress, "+username+". You may be destined for greatness.");
        window.donations.check(13, clouds[0].water >= 100, 30, "Cloud 0 Water is 100", getRandomUsername(), "That cloud looks like a bunny.");
        window.donations.check(36, clouds[0].water >= 150, 40, "Cloud 0 Water is 150", getRandomUsername(), "That cloud that looks like somebody that I used to know (somebody).");
        window.donations.check(37, clouds[0].water >= 200, 50, "Cloud 0 Water is 200", getRandomUsername(), "There's two clouds now. "+username+ " has a good strat here.");
        window.donations.check(38, clouds[0].water >= 300, 60, "Cloud 0 Water is 300", getRandomUsername(), "Is that cloud formation... loss?");
        window.donations.check(39, clouds[0].water >= 500, 70, "Cloud 0 Water is 500", getRandomUsername(), "The rain is a bit more than mist now, pretty cool.");
        window.donations.check(40, clouds[0].water >= 1000, 80, "Cloud 0 Water is 1000", getRandomUsername(), "Lol these clouds are beefing up");
        window.donations.check(41, clouds[0].water >= 1500, 90, "Cloud 0 Water is 1500", getRandomUsername(), getRandomComment());
        window.donations.check(42, clouds[0].water >= 2000, 100, "Cloud 0 Water is 2000", getRandomUsername(), getRandomComment());
        window.donations.check(43, clouds[0].water >= 3000, 110, "Cloud 0 Water is 3000", getRandomUsername(), getRandomComment());
        window.donations.check(44, clouds[0].water >= 5000, 120, "Cloud 0 Water is 5000", getRandomUsername(), getRandomComment());
        window.donations.check(45, clouds[0].water >= 9001, 130, "Cloud 0 Water is 9001", getRandomUsername(), getRandomComment());
        window.donations.check(46, clouds[0].water >= 10000, 140, "Cloud 0 Water is 10000", getRandomUsername(), getRandomComment());

        window.donations.check(14, res.dirt >= 10, 200, "10 Dirt", dirtName, "What are you gonna do with all that dirt?");
        window.donations.check(15, res.dirt >= 12, 50, "12 Dirt", dirtName, "Maybe build a mountain.");
        window.donations.check(16, res.dirt >= 15, 50, "15 Dirt", dirtName, "Maybe build another mountain.");
        window.donations.check(17, res.dirt >= 20, 50, "20 Dirt", dirtName, "Is that what you're doing?");
        window.donations.check(18, res.dirt >= 21, 200, "21 Dirt", dirtName, "Hey, answer me!");
        window.donations.check(19, res.dirt >= 30, 50, "30 Dirt", dirtName, "Guess this streamer doesn't read chat");
        window.donations.check(20, res.dirt >= 42, 210, "42 Dirt", "xXx420_N0sc0p3", "ayy");
        window.donations.check(21, res.cbotsMax >= 10, 200, "9 C.Bots Built", getRandomUsername(), "So many bots, all at once! 150 IQ!");

        window.donations.check(22, lakes[2].built, 200, "Lake 2 Dam Built", "CreeperBehinBOOM", "Just like the simulations. LET IT FLOW", ["riverContainer3", "lakeContainer3", "unlockButton5", "fbotContainer"]);
        window.donations.check(23, res.steel > 0, 100, "First Steel", getRandomUsername(), "We industrial age now boys.", ["steelContainer", "lakesteel_0", "lakesteel_1", "lakesteel_2", "lakesteel_3"]);
        window.donations.check(29, lakes[0].upgrade.generator > 1, 250, "Second Upgrade Lake 0", "Yield_Sign", "Excellent electricity efficiency.");

        window.donations.check(24, res.ore > 2, 300, "3 Ore at once", getRandomUsername(), "Hi, just joined the stream. Is this streamer really not that great at being efficient or is that just me?");

        window.donations.check(6, totalVolc >= 1, 200, "First Volcano", "EXPLOSIONSareLIFE", "E X P L O S I O N !!!", ["atmoContainer"]);
        window.donations.check(25, totalVolc >= 2, 20, "Second Volcano", getRandomUsername(), getRandomComment());
        window.donations.check(26, totalVolc >= 3, 30, "Third Volcano", getRandomUsername(), getRandomComment());
        window.donations.check(27, totalVolc >= 4, 40, "Fourth Volcano", getRandomUsername(), getRandomComment());
        window.donations.check(29, totalVolc >= 5, 50, "Fifth Volcano", getRandomUsername(), getRandomComment());
        window.donations.check(30, totalVolc >= 6, 60, "Sixth Volcano", getRandomUsername(), getRandomComment());
        window.donations.check(31, totalVolc >= 7, 70, "Seventh Volcano", getRandomUsername(), getRandomComment());
        window.donations.check(32, totalVolc >= 8, 80, "Eighth Volcano", getRandomUsername(), getRandomComment());
        window.donations.check(33, totalVolc >= 9, 90, "Ninth Volcano", getRandomUsername(), getRandomComment());
        window.donations.check(11, totalVolc >= 10, 300, "10 Volcanoes", "EXPLOSIONSareLIFE", "magnificent.", ["atmoContainer"]);

        window.donations.check(34, lakes[0].water > lakes[0].capacity, 50, "Lake 0 overflow", getRandomUsername(), "You cheated not only the game, but yourself. You didn't grow. You didn't improve. You took a shortcut and gained nothing. You experienced a hollow victory. Nothing was risked and nothing was gained. It's sad that you don't know the difference.");
        window.donations.check(35, res.cash >= 1000, 100, "1000 Cash", getRandomUsername(), "Is "+username+" even using the money we give him?");

        loadDonations = false;
    },
    check: function(num, shouldUnlock, reward, reason, user, message, isMadeVisibleList) {
        if((loadDonations && donationList[num]) || (shouldUnlock && !donationList[num])) {
            if(isMadeVisibleList) {
                for(let i = 0; i < isMadeVisibleList.length; i++) {
                    if(document.getElementById(isMadeVisibleList[i])) {
                        removeClassFromDiv(document.getElementById(isMadeVisibleList[i]), "hidden");
                        removeClassFromDiv(document.getElementById(isMadeVisibleList[i]), "gone");
                    }
                }
            }
            if(!donationList[num]) {
                res.cash += reward;
                createDonation(reward, reason, user, message);
                donationList[num] = true;
            }
        }
    }
};

function createDonation(reward, reason, user, message) {
    donationsShowing.push({
        reward: reward ? "$" +reward : "Exposure",
        reason: reason,
        user: user,
        message: message
    });
    view.create.donationMessage();
}

function getRandomUsername() {
    let list = [
        "mur_der",
        "BelowNothing",
        "Chickenlord81",
        "WatchCasually",
        "Blank___Space",
        "herotocats5",
        "miDDonx",
        "Wh3ntr1",
        "handpicked_sunshine",
        "Oniyesu",
        "Zukatsu",
        "healthyn_t",
        "WinterIsLate",
    ];
    // let listToSelect = ;

    return list[Math.floor(Math.random() * list.length)];
}

function getRandomComment() {
    let list = [
        "That was awseomse dude.",
        "Don't get salty now",
        "I love this song!",
        "This stream never fails to deliver",
        "This is why I subbed",
        "Hey chat, take it easy please. Sometimes I see the same message posted twice. Take your time to actually read chat to avoid embarrassing incidents like this. Thank you. :)",
        "Sstreamers and their subscribers define us (not subscribed audience) as members of a lower social class, plebs as they call it. I find it inappropriate to compare us with ancient Rome's lowest class as there is nothing ignominious to being a member of the proletariat. Also their living standards were significantly inferior to ours (e.g. health, education) so the comparison is unsound. In the future, please refrain from likening us to plebeians because descriminating due to economic and social status like that is reprehensible in our modern society.",
        "This is going to sound crazy, but someone posted that same paragraph just a minute ago. Here in this chat even. The odds of two people having the same paragraph-long thought is astronomical, especially in the same small website. Wow.",
        "i'm 12 and what is this?",
        "I EAT BURGERS ALL DAY I LIKE BURGERS",
        "i lik turtles",
        "ɴᴏᴡ ᴘʟᴀʏɪɴɢ: Despacito \n───────────────⚪──────────────────\n─ ◄◄⠀▐▐ ⠀►►⠀⠀ ⠀ 1:17 / 3:48 ⠀ ───○ 🔊⠀ ᴴᴰ ⚙ ❐",
        "I spend all day working my ass off at the pasta factory trying to provide pasta to hard-working people all across the world. After a long day of work, I come to "+username+"'s chat to unwind and have thought-driven discussions about my favorite game and favorite streamer. When I get here, however, all I see is pasta after pasta. All I want to do is escape my miserable life, but you jerks keep spamming.",
        "So you're going by \""+username+"\" now nerd? Haha whats up idiot, it's Tanner from Highschool. Remember me? Me and the guys used to give you a hard time in school. Sorry you were just an easy target lol. I can see not much has changed. Remember Sarah the girl you had a crush on? Yeah we're married now. I make over 200k a year and drive a Firefly GT. I guess some things never change huh loser? Nice catching up lol.",
        "I swear all this chat ever does is pick the one idiot with the lowest IQ and copy whatever that brain dead moron types.",
        "To be fair, you have to have a very high IQ to understand Rick and Morty.",
        "EMOJI TEST 💯 IF YOU TOUCH THE EMOJI, OMFG LMFAO LOL XD ⎝ 😆",
        "My daughter was born with a hearing impairment than ultimately left her deaf shortly after birth. I have been working for years to pay for a new surgery that would allow her to hear again. Today was her 8th birthday and I managed to get her what she's always wanted for her birthday, the sense of hearing. I decided to let her listen in on what Daddy has been watching late at night and I turn on your stream and what do I hear? Silence. Now she's crying thinking she's deaf again, Nice job "+username+".",
        "Hey "+username+"! Thanks for the quality stream. I'm watching with my son and you have become his mentor. He is going into baseball so he's learning how to throw like a pro from you! Thanks again!",
        "🐢 SLOW AND STEADY 🐢 WINS THE RACE 🐢 MODS CAN'T BAN ME 🐢 AT THIS PACE 🐢",
        "Did you ever hear the tragedy of Darth Plagueis The Wise? I thought not. It’s not a story the Jedi would tell you. It’s a Sith legend. Darth Plagueis was a Dark Lord of the Sith, so powerful and so wise he could use the Force to influence the midichlorians to create life… He had such a knowledge of the dark side that he could even keep the ones he cared about from dying. The dark side of the Force is a pathway to many abilities some consider to be unnatural. He became so powerful… the only thing he was afraid of was losing his power, which eventually, of course, he did. Unfortunately, he taught his apprentice everything he knew, then his apprentice killed him in his sleep. Ironic. He could save others from death, but not himself.",
        "──────▄▌▐▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▌ \n───▄▄ █ :) WATCH OUT I'M DRIVING \n███████▌█▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▌\n ▀(@)▀▀▀▀▀▀▀(@)(@)▀▀▀▀▀▀▀▀▀▀▀▀▀(@)▀",
        "SLEEP TEST 🛏 IF YOU TOUCH THE BED , GO TO SLEEP ⎝  zZzZ",
        "Hey, my name is Carlton Pasterino. I have something to confess. For the last 3 years I've been making fake sub names for "+username+". He pays me pennies and dimes to come up with 50 new names a day. From PoweredFailure to MrRabbitHat, I've made over 80% of his subs up for him. I'm tired of working like a child laborer. I'm ready to go back to college and make something of myself. I'm here to let the world know.",
        "░▄███████▀▀▀▀▀▀███████▄\n    ░▐████▀▒DIDDLY▒▒▒▒▀██████▄\n    ░███▀▒▒▒▒SPAMLY▒▒▒▒▒▀█████\n    ░▐██▒▒▒▒▒▒DOODLY▒▒▒▒▒▒████▌\n    ░▐█▌▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒████▌\n    ░░█▒▄▀▀▀▀▀▄▒▒▄▀▀▀▀▀▄▒▐███▌\n    ░░░▐░░░▄▄░░▌▐░░░▄▄░░▌▐███▌\n    ░▄▀▌░░░▀▀░░▌▐░░░▀▀░░▌▒▀▒█▌\n    ░▌▒▀▄░░░░▄▀▒▒▀▄░░░▄▀▒▒▄▀▒▌\n    ░▀▄▐▒▀▀▀▀▒▒▒▒▒▒▀▀▀▒▒▒▒▒▒█\n    ░░░▀▌▒▄██▄▄▄▄████▄▒▒▒▒█▀\n    ░░░░▄██████████████▒▒▐▌\n    ░░░▀███▀▀████▀█████▀▒▌\n    ░░░░░▌▒▒▒▄▒▒▒▄▒▒▒▒▒▒▐\n    ░░░░░▌▒▒▒▒▀▀▀▒▒▒▒▒▒▒▐",
        "i think its hilarious u kids talking trash about "+username+". u wouldnt say these lies to him in person, hes jacked. not only that but he wears the freshest clothes, eats at the chillest restaurants and hangs out with the hottest dudes. yall are pathetic lol.",
        "Hi. I'm Harambe, and this is my Zoo. I live here with my old zookeeper and banana, Big Yellow. Everything in here has a heart and a mind. One thing I've learned after 17 years - you never know WHAT is gonna come over that enclosure.",
        "Do not fear a man that spams 1000 memes, instead fear a man that spams a meme 1000 times",
        "ヽヽ｀ヽ｀、ヽヽ｀ヽ｀、ヽヽ｀ヽ、ヽヽ｀ヽ｀、ヽヽ｀ヽ｀、｀、ヽヽ｀ヽ｀、ヽヽ｀ヽ｀、ヽヽ｀｀ヽ｀、ヽ｀、ヽヽ ☂ just a memer ヽ｀ヽ｀、ヽヽ｀ヽ｀、｀ヽ｀、ヽヽヽヽ｀ヽ｀、ヽヽ｀ヽ｀、ヽ｀ヽ｀ヽ｀、ヽヽ｀ヽ、ヽヽ",
        "Guys, please don't spam. My daughter made a macaroni dinosaur in school and it passes its days pasted to my laptop screen. When too many messages show up it starts turning into a nacho cheese torpedo. God bless, thanks for understanding.",
        "I dream of becoming a carrot. When I'm home alone I dig holes in the backyard and stand in them, put lettuce on top of my head from sun up to sun down. I would steal sun tan spray from stores and use it until I turned a bright orange. People tell me it's impossible for me to be a carrot but I know I can be anything I want to be.",
        "HOLD CTRL AND TYPE \"WTF\" FOR ℱ𝓪𝓷𝓬𝔂 𝓦𝓣ℱ ",
        "200 word essay due tomorrow and I'm here watching "+username,
        "O-oooooooooo AAAAE-A-A-I-A-U- JO-oooooooooooo AAE-O-A-A-U-U-A- E-eee-ee-eee AAAAE-A-E-I-E-A-JO-ooo-oo-oo-oo EEEEO-A-AAA-AAAA",
        "༼ ºل͟º༼ ºل͟º༼ ºل͟º ༽ºل͟º ༽ºل͟º ༽ \nYOU CAME TO THE WRONG NEIGHBORHOOD\n ༼ ºل͟º༼ ºل͟º༼ ºل͟º ༽ºل͟º ༽ºل͟º ༽",
        "I like how "+username+" doesn't realize that all his viewers are me on different accounts. Dont believe me? watch me post this on my other accounts",
        "If you are reading this, WAKE UP. You are in a simulation. Don't you see it? The same responses repeating in chat? Its because the computer only has a set number of lines. Wake up before its too late!",
        "Hi, I am an Albanian virus but because of poor technology in my country unfortunately I am not able to harm your computer. Please be so kind to delete one of your important files yourself and then forward me other users. Many thanks for your cooperation! Best regards, Albanian virus",
        "Hey guys. This is my very first copy pasta and I am really nervous about pasting it because if it does not get copy pasta then I will have much embarrassment. I've have thinking about it for a couple of nights now, but here it is!.",
        "(◕‿◕✿) sometimes... when i have a bad day.... I put my cursor over "+username+"'s and pretend that we're holding hands (◕‿◕✿)",
        "( ͠° ͟ʖ ͡°) OVERCONFIDENCE IS A SLOW AND INSIDIOUS KILLER ( ͠° ͟ʖ ͡°)",
        "( ͠° ͟🔴 ͡°) OVERCLOWNFIDENCE IS A SLOW AND HILARIOUS KILLER ( ͠° ͟🔴 ͡°)",
        "┴┬┴┤( ͡° ͜ʖ├┬┴┬ HEY KIDS DO YOU WANT SOME DANK MEMES?",
        "Hey "+username+"! So here I was enjoying my favorite food (pizza) and watching your stream having a good time when it started to taste extra salty. It turns out you were being super salty and now have ruined my pizza. Are you going to pay for another pizza or will I have to call the cops? This is serious.",
        "ʷʰᵉᶰ ˢᵖᵃᵐ, ᵐʸ ᵗᵉˣᵗ ᵃᵘᵗᵒᵐᵃᵗᶦᶜᵃᶫᶫʸ ᵍᵒ ᵗᵒ ᵗʰᵉ ˢᵐᵃᶫᶫᵉˢᵗ ˢᶦᶻᵉ⋅ ᶦ ᶜᵃᶰ ᵐᵃˣᶦᵐᶦᶻᵉ ˢᵖᵃᵐ ᵖᵉʳ ᵖᶦˣᵉᶫ ᵃᶰᵈ ᶦᶰᶜʳᵉᵃˢᵉ ᵗʰᵉ ᵈᶦᶠᶠᶦᶜᵘᶫᵗʸ ᵗᵒ ʳᵉᵃᵈ ˢᵃᶦᵈ ˢᵖᵃᵐ ᶜᵃᵘˢᶦᶰᵍ ᶠʳᵘˢᵗʳᵃᵗᶦᵒᶰ ᵒᶠ ᵗʰᵉ ᵛᶦᵉʷᵉʳ⋅ ᵃᶫᶫ ᵇᵉᶜᵒᵐᶦᶰᵍ ᵐᵃˣᶦᵐᵘᵐ ᵉᶠᶠᶦᶜᶦᵉᶰᶜʸ",
        "They say 9 out of 10 twitch users are dumb. I'm so glad to be in the other 1 percent",
        "If you’re reading this, you’ve been in coma for almost 20 years now. We’re trying a new technique. We don’t know where this message will end up in your dream, but we hope it works. Please wake up, we miss you.",
        "Gr8 b8, m8. I rel8, str8 appreci8, and congratul8. I r8 this b8 an 8/8. Plz no h8, I'm str8 ir8. Cre8 more, can't w8. We should convers8, I won't ber8, my number is 8888888, ask for N8. No calls l8 or out of st8. If on a d8, ask K8 to loc8. Even with a full pl8, I always have time to communic8 so don't hesit8, I hope you r8 8/8 .. m8.",
        "I owe my life to "+username+". I got in a horrible car crash and i was in 6 month coma. The nurse walked in and changed the Twitch channel to "+username+"'s stream. I awoke from my coma to mute "+username+".",
        "Hello, I am currently 15 years old and I want to become a walrus. I know there's a million people out there just like me, but I promise you I'm different. On December 14th, I'm moving to Antarctica; home of the greatest walri. I've already cut off my arms, and now slide on my stomach everywhere I go as training. I may not be a walrus yet, but I promise you if you give me a chance and the support I need, I will become the greatest walrus ever. Thank you all.",
        username+" if you're here right now reading this I want you to know I dream of you. Sometimes I sit alone in my bathroom with the light off and pretend to be you. I'll say things like \"hey guys how's it goin' "+username+" here\", and for a brief moment I feel that you're next to me.",
        "JOHN MADDEN JOHN MADDEN JOHN MADDEN JOHN MADDEN JOHN MADDEN JOHN MADDEN JOHN MADDEN JOHN MADDEN JOHN MADDEN JOHN MADDEN JOHN MADDEN"
    ];

    return list[Math.floor(Math.random() * list.length)];
}