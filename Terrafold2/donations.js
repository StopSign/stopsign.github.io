window.donations = {
    tick: function() {
        window.donations.checkDonations();
    },
    checkDonations: function() {
        window.donations.check(0, true, 0, "Loaded game", "Dev", "Welcome to Terrafold, an Unfolding game about Terraforming. Click this message to make it disappear.", ["lakebuilt_0", "lakebuilt_1"]);
        window.donations.check(1, true, 1000, "Loaded game", "Dev", "To get started, spend all your cash on buying Ice, then work towards building a Construction Bot");
        window.donations.check(2, res.ore > 0, 200, "Built 1st C.Bot", "carolS43", "Congratulations on your first step in the galaxy, sweetie!! You're gonna do great out there :) :) XOXO -aunt carol");
        window.donations.check(3, res.ore > 0, 0, "First Donation", "Dev", "You'll get donations from your viewers for reaching some milestones. Buy more ice, and make a volcano explode!");
        window.donations.check(4, res.iron > 0, 100, "First Iron", getRandomUsername(), "We iron age now", ["ironContainer", "lakeiron_0", "lakeiron_1", "lakeiron_2", "lakeiron_3", "lakeiron_4"]);
        window.donations.check(5, unique.depth > 0, 200, "First Dig", "BeardsMakesTheMan", "Dig, dig, dig, dig");
        window.donations.check(6, totalVolc > 0, 300, "First Volcano", "EXPLOSIONSareLIFE", "E X P L O S I O N !!!", ["atmoContainer"]);
        window.donations.check(7, lakes[0].upgrade.generator > 0, 200, "First Upgrade Lake 0", "Yield_Sign", "Stream is interesting, I'll be watching for a while. Here's a starting boost, more to come.");
        window.donations.check(8, res.cbotsMax > 1, 200, "First C.Bot", "your_name_here", "Name if after me, pease.");
        window.donations.check(9, res.cbotsMax > 2, 50, "Second C.Bot", "your_name_here", "Please*");
        window.donations.check(10, res.cbotsMax > 41, 420, "42 C.Bots", "xXx420_N0sc0p3", "ayy");
        window.donations.check(11, totalVolc > 9, 300, "10 Volcanos", "EXPLOSIONSareLIFE", "magnificent. im crying", ["atmoContainer"]);
        window.donations.check(12, lakes[1].upgrade.generator > 0, 300, "First Upgrade Lake 1", "Yield_Sign", "I'm impressed by your progress. You may be destined for greatness.");
        window.donations.check(13, clouds[0].water > 1000, 200, "Cloud 0 Water is 1000", getRandomUsername(), "That one looks like a bunny.");


        window.donations.check(14, lakes[2].built, 200, "Lake 2 Dam Built", getRandomUsername(), "look at it go", ["riverContainer3", "lakeContainer3", "unlockButton4"]);
        window.donations.check(15, res.steel > 0, 100, "First Steel", getRandomUsername(), "We industrial age now boys.", ["steelContainer", "lakesteel_0", "lakesteel_1", "lakesteel_2", "lakesteel_3"]);


    },
    check: function(num, shouldUnlock, reward, reason, user, message, isMadeVisibleList) {
        if(shouldUnlock && !donationList[num]) {
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
            }
            donationList[num] = true;
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