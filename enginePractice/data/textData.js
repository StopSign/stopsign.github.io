

//Bulky text:
actionData.overclock.onCompleteText = {english:"+<b><span id='overclockActionPower'>1</span></b> Momentum to this action<br>"};

actionData.makeMoney.onCompleteText = {english:"-<b><span id='makeMoneyMomentumTaken'>1</span></b> Momentum taken from this action.<br>" +
        "+<b><span id='makeMoneyAmountToSend'>1</span></b> gold in Spend Money<br>"}
actionData.socialize.onCompleteText = {english:"-<b><span id='socializeMomentumTaken'>1</span></b> Momentum taken from this action.<br>" +
        "+<b><span id='socializeAmountToSend'>1</span></b> conversations in Chat with Locals<br>"}
// actionData.remember.onLevelText = {english:"+2 to the max level of Harness Overflow<br>+2 to the max level of Process Thoughts"}
actionData.makeMoney.extraInfo = {english:"<br>Exp & Gold gain = log(Momentum/100 * Action Power)^2 * Efficiency * Wages."}
actionData.socialize.extraInfo = {english:"<br>Exp & Gold gain = log(Momentum/100 * Action Power)^3 * Efficiency."}

//Story Text:
actionData.remember.storyText = {english:"Your world ended, and they only live on through you. Think about what they would have wanted for you, and on how much you miss them, and let it drive you forward. This is an internal story as much as it is an external one."}
actionData.overclock.storyText = {english:
        "The Emperor is dead, and with it his Decree has been lifted.\n\n" +
        "All have talents, and all talents are useful in some way, but also all are small. Though the talents are rarely exclusive to combat, a few of them can be used for fighting: \"Pull a close Object\" to disrupt a sword, \"Catch an Object\" to get your shield up in time, or \"Ripen a Fuit\" to get rations on the trail. Some of the stronger ones can even bend fate in strange ways, such as the famous \"What's Lost is Found\" that led Sir Galdrin to gather evidence of tax fraud in order for his Order to get their relics back.\n\n"+
        "And though you had grown up on stories of the wonders of Talents, when you grew up further you shook your head with the rest of the adults at the reality that it would never come. The Emperor had a Talent that he used to cast a Decree that other Talents be suppressed and hidden, thus securing his endless reign, and so it had been for over 400 years.\n\n" +
        "But on a cool spring day, you lifted your head to see the message that turns the world on its head.\n\n" +
        "[Decree lifted due to User death! You have been granted a Talent!]\n\n" +
        "The moment you finish the reading message, the text converts into a new message.\n\n" +
        "[Overclock][Desciption: Get a little more out of it][Target: <None>]\n\n" +
        ""

};
actionData.makeMoney.storyText = {english:"Your motivation to overclock spills over throughout your mind. Your general drive expands, and you put this to use in making money. At first it's whatever odd jobs you can find, with later getting employed, Making Money is the gateway to improving your situation."}
actionData.spendMoney.storyText={english:"At this village there are not many things to buy, but there are still the essentials you need. Buying things with the money you've earned gets you confidence, and the things improve your life to gain more energy."}

//Mana
// actionData.gatherMana.onCompleteText = {english:"+<b><span id=\"gatherManaActionPower\">1</span></b> Mana to Expel Mana<br>"};
// actionData.gatherMana.storyText = {english:"gather mana info"};

//Socialize
// actionData.socialize.onCompleteText = {english:"+<b><span id=\"socializeActionPower\">1</span></b> Conversations<br>"};
// actionData.socialize.storyText = {english:"socialize info"};

//Money



// actionData.makeMoney.onCompleteText = {english:"+<b><span id=\"makeMoneyActionPower\">1</span></b> Gold<br>"};
// actionData.makeMoney.storyText = {english:"mm info"};
//
// actionData.spendMoney.storyText = {english:"Simple and frivoloous things that make you happy, that you can't help spend on. " +
//         "A treat, a trinket, an upgrade, a waste - or is it? Well, there are better ways to spend gold."};



story = [
    {
        english: "The world was ending. Mark has a Talent. Claire tells him to report to the Delvers Guild to help out. He does, eventually"
    }
]