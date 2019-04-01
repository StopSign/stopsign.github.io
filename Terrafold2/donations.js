window.donations = {
    tick: function() {
        window.donations.checkDonations();
    },
    checkDonations: function() {
        window.donations.check(0, 1, 0, "Loaded game", "Dev", "Welcome to Terrafold, an Unfolding game about Terraforming. Click this message to make it disappear.");
        window.donations.check(1, 1, 0, "Loaded game", "Dev", "To get started, spend all your cash on buying Ice, then work towards building a Construction Bot");
        window.donations.check(2, res.ore > 0, 200, "Built 1st C.Bot", "carol43", "I'm so proud of you honey! -XOXO mom");
        window.donations.check(3, res.ore > 0, 0, "First Donation", "Dev", "You'll get donations from your viewers for reaching some milestones. Buy more ice, and make a volcano explode!");
    },
    check: function(num, shouldUnlock, reward, reason, user, message, isMadeVisibleList) {
        if(shouldUnlock && !donationList[num]) {
            if(isMadeVisibleList) {
                for(let i = 0; i < isMadeVisibleList.length; i++) {
                    removeClassFromDiv(document.getElementById(isMadeVisibleList[i]), "hidden");
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