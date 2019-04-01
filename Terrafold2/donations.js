window.donations = {
    tick: function() {
        window.donations.checkDonations();
    },
    checkDonations: function() {
        window.donations.check(0, true, 0, "Loaded game", "Dev", "Welcome to Terrafold, an Unfolding game about Terraforming. Click this message to make it disappear.", ["lakebuilt_0", "lakebuilt_1"]);
        window.donations.check(1, true, 1000, "Loaded game", "Dev", "To get started, spend all your cash on buying Ice, then work towards building a Construction Bot");
        window.donations.check(2, res.ore > 0, 200, "Built 1st C.Bot", "carol43", "I'm so proud of you honey! -XOXO mom");
        window.donations.check(3, res.ore > 0, 0, "First Donation", "Dev", "You'll get donations from your viewers for reaching some milestones. Buy more ice, and make a volcano explode!");
        window.donations.check(4, res.iron > 0, 100, "First Iron", getRandomUsername(), "We iron age now", ["ironContainer", "lakeiron_0", "lakeiron_1", "lakeiron_2", "lakeiron_3", "lakeiron_4"]);
        window.donations.check(5, totalVolc > 0, 300, "First volcano", "EXPLOSIONSareLIFE", "E X P L O S I O N !!!", ["atmoContainer"]);
        window.donations.check(15, res.steel > 0, 100, "First Steel", getRandomUsername(), "We industrial age now boys.", ["steelContainer", "lakesteel_0", "lakesteel_1", "lakesteel_2", "lakesteel_3"]);

        window.donations.check(14, lakes[2].built, 200, "Lake 2 Dam Built", getRandomUsername(), "look at it go", ["riverContainer3", "lakeContainer3", "unlockButton4"]);
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
    let list = ["Username1",
    "Username2",
    "Username3",
    "Username4",
    "Username5"];

    return list[Math.floor(Math.random() * list.length)];
}