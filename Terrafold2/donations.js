window.donations = {
    tick: function() {
        window.donations.checkDonations();
    },
    checkDonations: function() {
        window.donations.check(0, true, 0, "Loaded game", "Dev", "Welcome to Terrafold, an Unfolding game about Terraforming. Click this message to make it disappear.", ["lakebuilt_0", "lakebuilt_1"]);
        window.donations.check(1, true, 1000, "Loaded game", "Dev", "To get started, spend all your cash on buying Ice, then work towards building a Construction Bot");
        window.donations.check(2, res.ore > 0, 200, "Built 1st C.Bot", "carolS43", "Congratulations on your first step in the galaxy, sweetie!! You're gonna do great out there :) :) XOXO -aunt carol");
        window.donations.check(3, res.ore > 0, 0, "First Donation", "Dev", "You'll get donations from your viewers for reaching some milestones. Buy more ice, and make a volcano explode!", ["lakeiron_0"]);
        window.donations.check(4, res.iron > 0, 300, "First Iron", getRandomUsername(), "We iron age now", ["ironContainer", "lakeiron_0", "lakeiron_1", "lakeiron_2", "lakeiron_3", "lakeiron_4"]);
        window.donations.check(5, unique.depth > 0, 200, "First Dig", "BeardsMakesTheMan", "Dig, dig, dig, dig");

        window.donations.check(7, lakes[0].upgrade.generator > 0, 200, "First Upgrade Lake 0", "Yield_Sign", "Stream is interesting, I'll be watching for a while. Here's a starting boost, more to come.");
        window.donations.check(8, res.cbotsMax > 1, 200, "First C.Bot Built", "your_name_here", "Name if after me, pease.");
        window.donations.check(9, res.cbotsMax > 2, 50, "Second C.Bot Built", "your_name_here", "Please*");
        window.donations.check(10, res.cbotsMax > 41, 420, "42 C.Bots", "xXx420_N0sc0p3", "ayy");

        window.donations.check(12, lakes[1].upgrade.generator > 0, 300, "First Upgrade Lake 1", "Yield_Sign", "I'm impressed by your progress. You may be destined for greatness.");
        window.donations.check(13, clouds[0].water > 1000, 200, "Cloud 0 Water is 1000", getRandomUsername(), "That one looks like a bunny.");
        let dirtName = getRandomUsername();
        window.donations.check(14, res.dirt >= 10, 200, "10 Dirt", dirtName, "What are you gonna do with all that dirt?");
        window.donations.check(15, res.dirt >= 12, 50, "12 Dirt", dirtName, "Maybe build a mountain.");
        window.donations.check(16, res.dirt >= 15, 50, "15 Dirt", dirtName, "Maybe build another mountain.");
        window.donations.check(17, res.dirt >= 20, 50, "20 Dirt", dirtName, "Is that what you're doing?");
        window.donations.check(18, res.dirt >= 21, 200, "21 Dirt", dirtName, "Hey, answer me!");
        window.donations.check(19, res.dirt >= 30, 50, "30 Dirt", dirtName, "Guess this streamer doesn't read chat");
        window.donations.check(20, res.dirt >= 42, 210, "42 Dirt", "xXx420_N0sc0p3", "ayy");
        window.donations.check(21, res.cbotsMax >= 10, 200, "9 C.Bots Built", getRandomUsername(), "So many bots, all at once! 150 IQ!");

        window.donations.check(22, lakes[2].built, 200, "Lake 2 Dam Built", getRandomUsername(), "look at it go", ["riverContainer3", "lakeContainer3", "unlockButton4"]);
        window.donations.check(23, res.steel > 0, 100, "First Steel", getRandomUsername(), "We industrial age now boys.", ["steelContainer", "lakesteel_0", "lakesteel_1", "lakesteel_2", "lakesteel_3"]);

        window.donations.check(24, res.ore > 2, 300, "3 Ore at once", getRandomUsername(), "Hi, just joined the stream. Is this streamer really efficient?");

        window.donations.check(6, totalVolc > 0, 500, "First Volcano", "EXPLOSIONSareLIFE", "E X P L O S I O N !!!", ["atmoContainer"]);
        window.donations.check(25, totalVolc > 1, 100, "Second Volcano", getRandomUsername(), getRandomComment());
        window.donations.check(26, totalVolc > 2, 150, "Third Volcano", getRandomUsername(), getRandomComment());
        window.donations.check(27, totalVolc >= 5, 180, "Fifth Volcano", getRandomUsername(), getRandomComment());
        window.donations.check(28, totalVolc >= 8, 199, "Eigth Volcano", getRandomUsername(), getRandomComment());
        window.donations.check(11, totalVolc > 9, 500, "10 Volcanoes", "EXPLOSIONSareLIFE", "magnificent.", ["atmoContainer"]);
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
        "healthyn_t"
    ];

    return list[Math.floor(Math.random() * list.length)];
}

function getRandomComment() {
    let list = [
        "That was awseomse dude.",
        "Kappa",
        "LUL True",
        "Outstanding move",
        "Don't get salty now",
        "You're going with that?",
        "I love this song!",
        "This stream never fails to deliver",
        "This is why I subbed",
        "A little something to celebrate"
    ];

    return list[Math.floor(Math.random() * list.length)];
}