

//Bulky text:
actionData.overclock.onCompleteText = {english:"+<b><span id='overclockActionPower'>1</span></b> Momentum to this action<br>"};

actionData.makeMoney.onCompleteText = {english:"-<b><span id='makeMoneyMomentumTaken'>1</span></b> Momentum taken from this action.<br>" +
        "+<b><span id='makeMoneyAmountToSend'>1</span></b> gold in Spend Money<br>"}
actionData.socialize.onCompleteText = {english:"-<b><span id='socializeMomentumTaken'>1</span></b> Momentum taken from this action.<br>" +
        "+<b><span id='socializeAmountToSend'>1</span></b> conversations in Chat with Locals<br>"}
// actionData.remember.onLevelText = {english:"+2 to the max level of Harness Overflow<br>+2 to the max level of Process Thoughts"}
actionData.makeMoney.extraInfo = {english:"<br>Exp & Gold gain = log10(Momentum/100 * Action Power)^3 * Efficiency * Wages."}
actionData.socialize.extraInfo = {english:"<br>Exp & Conversations gain = log10(Momentum/100 * Action Power)^3 * Efficiency."}

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

actionData.meetVillageLeaderScott.storyText = {english:Raw.html`
Introductions with Scott as a village leader are nothing to note - he tells me not to make trouble and that he's open to chatting about any problems. He wants to help make the community work well. He seems like a good man. Past the introductions, when I really strike up a conversation with him, he opens up. 

"Did you see any birds on the road?" the softly smiling man asked about anything interesting he'd seen. I didn't think to look, and said as much. "You should! There's a particularly golden one I only got a glimpse of!" He's passionate about this, but I am not. There might still be something worthwhile in finding this "golden bird" though.

I ask if I can help out, and he gives me a job! It's just helping him out with some chores, but he pays me for it.

Scott is really nice. I wish more people like him existed - my life would have gone differently. The more I chat with him, the more I remember the few soldiers I knew who were similar. It's a good connection, a good memory, and I have precious few of those. 

It also reminds me of how those men died, which starts to be more than I can handle for the moment. I have to start reminding myself that this is Someowhere Safe, but ultimately I am not quite up to do the task of socialization. I'm glad I ended up here though, and for the peace it has offered me.
`};

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