

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
actionData.overclock.storyText = {english:Raw.html`
"Overclock: Choose a target; get a little more out of it". Abilities are given intuitively, and the Description was part of that intuitive understanding, given as soon as one has understood all of the words within the description. Overclock works by using the concept of momentum to improve the target over time. The target will be denied unless it meets the criteria, which is any type of action you can do over and over until you get better at it.<br><br>

That feeling, that concept - momentum - had been spilling over somehow from having the target set to itself. Momentum had started to apply itself in small ways to anything I started doing that fit the targeting criteria, and the momentum had me continue doing whatever it was, helping me to do so.<br><br>

As long as I stated doing something targetable - even without me realizing it - the concept spillover would latch on. My thoughts were starting to overlap, and improve. My ability to distill insights into wisdom started becoming a pillar of self-improvement. I could... remember, without the pain or judgement. I could grow back into being alive, using this ability as a safety net and crutch at the same time. I just needed to exist while doing more things over time, and through patience I would gain the strength needed to cleave mountains.<br><br>

I would be prepared so that the next time a threat came along, I would be strong enough to save not only myself, and finally repay this debt.`
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