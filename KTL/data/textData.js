function processActionStoriesXML() {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(actionTextData, "application/xml");

    if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
        console.error("Fatal Error: Could not parse XML string in actionTextData.");
        return;
    }

    const actionNodes = xmlDoc.documentElement.children;

    for (const actionNode of actionNodes) {
        const actionName = actionNode.tagName;
        const textElement = actionNode.querySelector(language);

        if (textElement) {
            if (!actionData[actionName]) {
                console.error(`Error: Action '${actionName}' from XML does not exist in actionData.`);
                continue;
            }
            const englishText = textElement.textContent;

            if (!actionData[actionName].storyText) {
                actionData[actionName].storyText = {};
            }

            actionData[actionName].storyText.english = englishText;
        }
    }
}

const actionTextData = `
<actionStories>
    <overclock>
        <english><![CDATA[
            (See Backstory in Menu -> Backstory)<br><br> 
            
            "Choose a valid target; get a little more out of it" is the description on my Talent, Overclock. Though I had experimented with many targets in my youth, after the Ashmarch and my subsequent escape I had grown a deep paranoia that I would not have an option to flee, and so I set the target of the Talent to itself: Overclock.<br><br>
            
            In the safety that Overclock had granted, I discovered that the Talent was not simply building passively, but instead giving a sense of pressure that needed to spill over. At first, I pointed this pressure towards doing chores quicker to keep the ability from spilling over into my thoughts, but eventually it wasn't enough, and I let the extra momentum spill into what it would.<br><br>
            
            <div class="menuSeparator"></div><br>
            
            Though most Talents tend to be complex abilities with many secrets, Overclock seemed to have secrets upon secrets. The libraries and scholars I had access to while growing up had no understanding of what "overclock" meant as a word, besides what they could guess at from the portmanteau. This alone wasn't unique - many Talents such as Sniper, Glitch, or Gridlock had been recorded with similarly unknown definitions or origins. The name implied a temporal-based ability, and when one scholar thought to measure it, it was shown to be a gain of one part in ten more than otherwise. Overclock was classed as a versatile, yet minor Talent, and they told me I'd make a good craftsman's assistant one day.<br><br>
            
            When Overclock was locked behind the country-wide curse for 13 years on the target: [Get Somewhere Safe], the feel of it had been completely removed. When the curse came undone, the pent-up pressure was sudden and overwhelming, and proceeded to bend fate to a level unheard of in any legend. It worked, and I got my safety - at the expense of the years of buildup. In an effort to repeat the past, and gain an option for ultimate safety again, I changed the target of Overclock to target itself: Overclock.<br><br>
            
            Soon enough, a different kind of pressure was building, and rather than being locked behind an immutable gate like before, it spilled over into any action I performed that the concept of "momentum" could be applied to. At first, all I knew is that it needed direction, and as I came to terms with what that meant, I let it pour into the place I had been avoiding - my own thoughts. 
        ]]></english>
    </overclock>
    
    <reflect> 
        <english><![CDATA[
            I sat down and closed my eyes, and thought about who I was. I was a hidden refugee, unhunted and obscure. I was a man grown, born from parents who loved me, a village that taught me, and a country that I shared the curse's burden with. I was a soldier, who had seen far too many die without ever swinging my sword once in combat. Gods, the way the black fire consum- I shook myself.<br><br>
            
            Focusing did not come naturally or easy to me, but I was forcibly moved past the building panic by my relentless Talent's need to do something I could grow with. As I considered who I was, from the moments that shaped me to the words that guided my path, I felt the momentum latch on to... something, and with the connection it provided a nascent sense of awareness of what was happening. I felt a feeling I had no words to describe, but I started to recognize the shape of the action it was connecting to: Reflection.<br><br>
            
            My thoughts rapidly became circular - I needed to think about thinking. I needed to exist in a layer of abstraction above my thoughts - to watch my own thoughts and guide them to reflecting, while still holding on to the idea of reflection itself. <br><br>
           
            It was oddly circular - I was using my own thoughts to look at my thoughts. Like trying to learn what my eyes looked like in a mirror, but underwater and with multicolored lights and various translucent objects in front of me, evershifting. The knowledge was there, but never in whole: I needed to distill the insight from the noise. To my surprise, as I shifted my thoughts from observing my own thoughts into attempting to notice the pushes and leaps forward that were spurned on by my power, that thought in itself became latched onto as well, creating another stream of momentum in my core.<br><br>
            
            I was starting to understand the nature of how my ability was influencing things. However, as the monstrous complexity of what this meant started to hit me, I realized this would be a long journey.
        ]]></english>
    </reflect>
    
    <distillInsight>
        <english><![CDATA[
            I managed some form of abstract thoughts, watching how I was thinking. It was difficult, and required immense concentration, but as I held the concept and momentum continued to flow to it, I found the additional concentration made the "container" for Reflection smaller, more compact, more defined - I had a better target to aim for, it felt, and a better understanding of how momentum should sit inside that container.<br><br>
            
            The thoughts kept slipping out of my control, though. The momentum didn't want to stay still, and no matter the direction I pointed it in, it would splash over the container. I mentally collected what I could and redirected it, but it was tough work. After some useless attempts at redirection, I went back to simply reflecting and observing, and came to a new question: how was it that Overclock was spilling over in the first place?
        ]]></english>
    </distillInsight>
    
    <harnessOverflow>
        <english><![CDATA[
            As my awareness and concentration grew, I realized a new truth about my ability: it was spinning. My increasing awareness was able to get a feel for the nature of the movement contained with Overclock, and I found that it was not like a waterfall, but instead like a whirlpool. The momentum - from wherever Overclock pulled it from - was cycling in a shape I could not yet recognize. The effects I had been feeling - the pushes to act - were the small splashes of conceptual momentum falling outside the vortex. I had been directing the main stream, but there were plenty of splashes that didn't immediately coalesce into it.<br><br>
            
            I held my focus on the spillage for a time, and found that, eventually, it always rejoined the main current; momentum did not stop until it was captured. Now that I was looking for it, I realized that the other actions that momentum had latched onto also had their own spiral, but they moved downwards into the action rather than upwards out of the generator.<br><br>
            
            Knowing this, I could harness the overflow more intentionally. I redirected the splashes of momentum back into Overclock, and the vortex sped up faster and faster, becoming larger and creating even more spillage. There seemed to be a limit, but as long as I kept intentionally bringing the overflow back and using it to speed the cycle, more momentum spilled into the main stream.
        ]]></english>
    </harnessOverflow>
    
    
    <takeNotes>
        <english><![CDATA[
            I started being overwhelmed with all the different findings. After gathering some bark and charcoal, I resumed to my internal exploration armed with the power to keep notes.<br><br>
            
            As expected, momentum latched on quickly to the act of taking notes itself, and though I was not skilled in writing before, I found my hand flowing and keeping up with my thoughts. I tried to draw the pattern of flow of sensing, but besides a rough correlation of how close each action was to each other, there was not enough information to see a larger pattern. I decided to put it down anyway, and with some thought I decided that Reflect was to the southwest of Overclock, with Distill Insight, Harness Overflow, and the newly acquired Take Notes branching off further westward.<br><br>
             
            I recorded everything I had experienced so far, and reviewed it with my growing sense of self-reflection. It was only when I tried to measure the river as it changed from moment to moment that I could see the truth: Overclock was growing... significantly. I seemed to adjust to the feeling as well, so I hadn't noticed until I started recording my observations.<br><br>
            
            Up 'til that point I had been reacting to what was happening to me, trying to understand it, but at this point I felt a seed of curiosity take root in me. Overclock was still growing at a steady pace, spurned on by my guidance and awareness; what else could I do with the momentum?<br><br>
        ]]></english>
    </takeNotes>
    
    
    <bodyAwareness>
        <english><![CDATA[
            Momentum is the measure of an object's motion, but it also propels all things forward. I had been sitting still, but as I became afflicted with curiosity, I stood up and started moving, paying attention to my body. I had to split my focus from my mental self to my physical self, and Overclock responded accordingly, giving me a new direction - a new main stream - to direct the momentum into.<br><br>
            
            With increased awareness, I could notice more eddies and knots in the flow within Overclock, and with focus I could start to smooth them out, letting it spin with more regularity. I also noticed that as the vortex of momentum being generated grew, so too did its instability - more awareness would still grant me further insight for a while yet.<br><br>
            
            As I walked, the new sense of myself led to new insights, but I rapidly felt that I hit the limit of my comprehension. To continue, I felt I would need to do more things with my body. I needed to move with purpose. I reflected on my options before deciding that I should go do what I had been putting off: meeting my neighbors.
        ]]></english>
    </bodyAwareness>
    
    
    <travelOnRoad>
        <english><![CDATA[
            As I set off with purpose, I felt Body Awareness respond accordingly, accepting more momentum down into its whirlpool before it felt closed off, and instead became a lazily spinning pool - I shifted the flow more towards the traveling itself, and started to find the familiar skips in my steps as I walked through the sparse forest and rolling hills on my way to the outpost.<br><br>
            
            As the expected whirlpool formed around traveling, I mentally labeled as being East - forward. I was still mostly looking inwards, and so I did not see much on my journey except some particularly colorful birds gathered around a denser thicket. I walked past, and found the more established road to the outpost.
        ]]></english>
    </travelOnRoad>
    
    
    <travelToOutpost>
        <english><![CDATA[
            Being on a paved road afforded me the leniency of not needing to watch every step, and my mind felt free to wander accordingly. Using the peace of the road, I let it wander to memories I had been putting off: the Ashmarch. I slowed down at first to reflect on how I wanted to remember it, and slowed further to direct momentum to aid me in the memories, but I reached the fork in the road announcing the outpost being close by before the sun had moved much more in the sky.<br><br>
            
            There was an old wall of wood and stone standing from when this outpost had been a frontier station, prepared against the wilderness, but now the years of disrepair had created lots of gaps in the aged defenses. It was nothing important; this was far inside the borders of Osric, and no monsters came to this part of the world.<br><br>
            
            The entry had had its doors completely removed, and no guards were posted, but there was life inside. I gathered myself and stepped inside carefully, trying not to startle at every sudden noise or loud voice that assaulted my senses. I saw the bustle of a market and steered away, not prepared for such chaos yet. I passed a notice board filled with information that overwhelmed me, and continued forward without purpose, mostly trying not to get in anyone's way as they went about their daily life.<br><br>
            
            Luckily, an older man noticed my confusion and wariness and stepped up to greet me.
        ]]></english>
    </travelToOutpost>
    
    
    <remember>
        <english><![CDATA[
            The Ashmarch was a time of horrors, and even though I intended to confront the horror that I had experienced with the peace of the journey on the road, it still proved too much and nearly froze me altogether. So, I started with something I felt more comfortable with: remembering how we got there.<br><br>
            
            Being conscripted was simple: Sovvgor's recruiters came with shiny equipment and even brighter words, though with a demand that each hamlet must provide some able-bodied adults for the war. I saw them eyeing Gary and his large build, even though he was apprenticed to our town's herbalist, and felt it necessary to volunteer to fill the quota before they crippled our hamlet's future. I had intended to return after it was over, and limited my mother to only a quick goodbye. I wondered of their fates, and if I would ever learn the truth now. I had many small regrets from that day, and felt many complicated things, but my decision to leave carried no shame.<br><br>
            
            The training that Sovvgor forced upon us was sudden and poorly coordinated. My equipment had came from smiths without the Talent for it, guided by commanders who actually had to learn from books and communication instead of being naturally gifted. We swung swords for a week before they decided maces would work better against Talented armor, and then switched to spears yet again later. I rememberd the feeling of training, and how unaccustomed I was at the types of movements being asked of me. I resolved to find a better trainer later, if only to rewrite the memories into something new.<br><br>
            
            In Talented combat, there were certain archetypes to fill to create versatile squads of warriors. In Talented war, these squads were gathered according to the strongest Talent into a larger specialty group, largely fitting under four groups: vanguards, scouts, rearguards, and supports. The conscripted women were steadily poached to be trained as supports and archers, and the heavier men were poached to be the close range vanguards. I was eventually ordered into a scouting group, and given flexible leather armor and a light sword.<br><br>
            
            It was a mess from the start, and the uncertainty became fear when it sat for too long, but as we learned through bits of gossip here and there, it was not even the largest problem in our army. Sovvgor's mages, once renowned for being supported far more in their Talent's use than other countries, had grown greedy and selfish in their egos. Ever since the beginning of the curse, they had steadily been slipping away into uncursed land to continue their talents, leaving only distractions to keep Sovvgor off of their trail as long as possible. As more mages failed to report during our training, the enthusiastic speeches of victory and glory steadily were replaced with preaching the necessity of begging the Gods for a favor.<br><br>
            
            The truth was kept from us common soldiers, to keep our feet moving until it was far too late. The full extent of the mage's betrayal became apparent on the second day, when we were beset by flying birds craft out of fire and explosive force - the Talent of Sovvgor's best fire mage. If they could entice even those that rode with the Emperor to defend our country from the lich... what hope we had left died that day.<br><br>
            
            I still marched onwards, and as I recognized myself falling so deep into the memory as to change my leisurely stroll into a step reminiscent of the death march, I forcibly brought my mind elsewhere, to remember happier moments of my childhood.<br><br>
            
            As I remembered, and as momentum funneled down into the whirpool of the action of remembering, I felt an internal tension release in various stages. With new concentration, I was able to consider a little more at once, as if I could see more details of the flow of momentum, and I noticed that there were previously-ignored splashes from overclock that I could redirect. I redirected some of the stream back into controlling the cycle of overclock, increasing its speed even more. 
        ]]></english>
    </remember>
    
    
    <meetVillageLeaderScott>
        <english><![CDATA[
            The old man introduced himself as Scott, the village leader. Scott came across as a happy, untroubled man, looking at me with kind eyes. He was patient as I twiched to every noise, and thankfully avoided questions about my past. He told me not to make trouble - that this outpost was overdue to become a named village with how it had grown, but still gossiped about everything new. He also said that his self-assigned title was village leader because the paperwork from the capitol hadn't gone through to provide them an actual name just yet, but this place had grown beyond being an outpost for some time.<br><br>
            
            Scott told me to take things at my own pace, I was thankful for the advice and said as much, and he declared that that was all for the introduction. Then he asked me about his passion - did I see any colorful birds? I told him I had seen some by a thicket, and Scott truly lit up, tripping over his own words in his excitement to talk about them. His subsequent conversation about bird classificatons and names went entirely over my head, but it culminated in him talking about his desire to find a particular bird he had only seen once.<br><br> 
            
            "It was golden and glowing, I tell you!" he exclaimed, hands moving animatedly. "Did you see it?"<br><br> 
            
            I was distracted moving past the thicket with birds before, but surely I would have remembered a golden bird. I said I hadn't, and it only revealed his spark of excitement that Scott had been the only one so far to witness it. I resolved to go find that spot again, and see if I could find it. At the very least, it would be entertaining to get another passionate lecture from the enthusiastic man. His smile sparked pleasant memories of a better time, and I enjoyed the narrowly focused conversation in lieu of heavy conversation.<br><br>
            
            Eventually Scott noticed my lack of contribution and switched topics - if I needed a helping hand to start, he had various chores and tasks around the village that he had for me, and would pay me some gold to do them - just enough to feel comfortable with the market, but not enough to be overwhelmed by the big purchases yet. He said it would ease me in to the village, and I agreed.
        ]]></english>
    </meetVillageLeaderScott>
    
    
    <watchBirds>
        <english><![CDATA[
            Over the next few days I fell into a routine of journeying to the outpost, enjoying the feeling of the momentum moving with me into the other activities I was starting to physically repeat. I found the thicket with colorful birds, and though I didn't have my notes with me, I could observe what I could.<br><br>
            
            The birds were of many colors, though none were golden or glowing. When I talked with Scott about my observations, he lit up with passion and immediately wanted to know what I saw, and I described it as best as I could.<br><br>
            
            Scott taught me about the behaviors based on colors and beak shapes that we saw. The short, thin beaks meant those birds ate insects. The long, thin, straight beaks were for chiseling. When I mentioned that I saw a particularly colorful bird with a very large, curved beak, he mentioned there might be fruit as well.<br><br>
            
            I was trying to chase one such bird one day when I happened to catch a particular scent. It reminded me of the pies around the market that I had been steadily gaining familiarity with, and I resolve to figure out the connection.<br><br>
        ]]></english>
    </watchBirds>
    
    
    
    <catchAScent>
        <english><![CDATA[
            The scent was elusive, and not present all days. When the wind shifted and I caught the scent, it was a sweet and enticing smell. I started paying closer attention to where in forest I was catching the smell, and after a few days I was able to roughly figure out a direction to head towards. Unfortunately, the path led me to a cliff that I could not scale. While I thought I could explore further and find a path up the cliff, at the moment this was as far as I could get.<br><br>
            
            Scott was still happy to hear about all the birds I found along the path.
        ]]></english>
    </catchAScent>
    
    
    <helpScottWithChores>
        <english><![CDATA[
            (WIP)<br>
            I was making gold again after living for months on only what I could make myself, and though it was a small amount to start, it helped me gain recognition of the village, and be recognized in turn. The chores Scott asked me for were varied, and I steadily learned who was who in the town.<br><br>
            
            He asked me to deliver lunch to the nearby woodsmen, to help an old man check that his stock was prepared for winter, and to give an order to the blacksmith.
        ]]></english>
    </helpScottWithChores>
    
    
    
    <makeMoney>
        <english><![CDATA[
            Making money was an interesting action for momentum to latch onto. It seemed to be an endless vortex, consuming momentum as I worked, albeit inefficiently compared to other actions. My ability to work increased over time, and I got more gold for the increases as a result. Feeling my pockets heavier through the efforts of my own actions gave me a sense of accomplishment - and I cannot deny that it also gave me a sense of greed. These feelings combined gave me an ambition towards making more money. With Overclock's momentum pushing me forward, I was growing into becoming the equal of many workers at once. I resolved to take jobs that paid by the task, so that I could take advantage of the increasing speed with which I did tasks.<br><br>
            
            Gold was a tool, and I would use it to improve my situation. The more coin I had and spent, the more prepared I would be for when I truly needed Overclock's fate-bending ability.
        ]]></english>
    </makeMoney>
    
    <spendMoney>
        <english><![CDATA[
            (WIP)
            The market is big, but my access was limited. There seemed to be unspoken rules before a merchant would let me access their wares. For now, I could buy from small street stalls at the edge of the market. I bought iron nails to lower the rattling of wind in my cabin, and bedding and blankets to make my nights easier, and my sleep more restful. Curiously, they would not sell any of the food to me - perhaps I was simply far too poor to afford it. The economy of such a town was strangely deep, and I wondered what was happening.
        ]]></english>
    </spendMoney>
    
    <checkNoticeBoard>
        <english><![CDATA[
            (WIP)
            Scott pointed me to the board, and it was full of information - too much, in fact. The notices were varied, and piles deep.
        ]]></english>
    </checkNoticeBoard>
    
    <talkWithScott>
        <english><![CDATA[
            (WIP)
            "Oh wow, you actually want to know about me? Well, I've been here a long time."<br><br>
            
            Scott and you keep talking for a while, and then he mentions that he overheard you've been doing good work, and has more people to recommend you to.
        ]]></english>
    </talkWithScott>
    
    <learnToStayStill>
        <english><![CDATA[
            (WIP)
            The first step in how to create your own magic: Stay Still. I had been trying not to do this, but with the instructions of the hermit, I found new cause to try again. I don't hide my struggle with the task, and the old man scoffs.<br><br>
            
            "Do this on your own time, but later you should try meditation. Write things down if you have trouble with it."<br><br>
            
            He was surprisingly less grumpy as he said it, and with a look at my face his scowl returned.
        ]]></english>
    </learnToStayStill>
    
    
    <visitShrineBehindWaterfall>
        <english><![CDATA[
            (WIP)
            You pay respect to the shrine, and feel your amulet resonate with feelings around this shrine.
        ]]></english>
    </visitShrineBehindWaterfall>
    
    <hearAboutTheLich>
        <english><![CDATA[
            (WIP)
            It is my worst nightmare become reality; the lich has returned. My lost home country, Sovvgor, had only ever delayed the lich with the Emperor's Curse. All I had known, all the horror I had witnessed... was only a delay. Perhaps that situation was engineered by the lich in the background, in order to get around the blockade of the Curse.<br><br>
            
            It mattered little. There was a lich, it was coming for all humanity, and I was prepared.<br><br>
            
            I was terrified at the idea of trying to go against the lich, but I thought of how many lives had been sacrificed and ruined at the altar of this monstrosity's rampage. In what felt like such a short time, Overclock had grown far beyond what I had achieved to Get Safe, and I was ready; I could bend fate in my favor to kill the lich.<br><br>
            
            This time, however, I was going to go prepared; I knew Fate could only bend so far at a time. I had just received magic, and knew that all I needed was to show I had the power to help, and the War for Life would let me join.<br><br>
            
            So, I changed the target of Overclock, from itself to a new target: Kill the Lich. I felt my thoughts collapse, no longer held up by the artificial momentum. I became focused, with only a single goal in mind: letting my ability life my legs, move my mouth, and swing my sword. For better or worse, I was along for the ride.
        ]]></english>
    </hearAboutTheLich>
</actionStories>
`;










































//Story Text:

// actionData.talkWithScott.storyText = { english:Raw.html`
// &nbsp;&nbsp;&nbsp;&nbsp;"Oh wow, you actually want to know about me? Well, I've been here a long time."<br>
// Scott and you keep talking for a while, and then he mentions that he overheard you've been doing good work, and has more people to recommend you to.
// `}
// actionData.bodyAwareness.storyText = { english:Raw.html`
// &nbsp;&nbsp;&nbsp;&nbsp;I was tapping my pen on my chin when I suddenly focused on the sensation - was there a way to use
// my momentum on my own proprioception? To mindfully move each of my muscles at all times would be incredible! I could craft such fine tools!<br><br>
//
// After some focus, I felt a new conceptual river open up from Overclock, flowing into the idea of being aware of myself.
// For a moment, it was incredible to realize that I could expand this way, but rapidly I felt I hit my limit of comprehension.<br><br>
//
// Still, the newfound awareness had me desire to move around; I just had to find a purpose to do so.
// `}
// actionData.takeNotes.storyText = { english:Raw.html`
// &nbsp;&nbsp;&nbsp;&nbsp;I started realizing the difficulties of understanding what was changing, so I started taking notes.
// At first, I recorded the patterns, but as it helped me understand exactly how Overclock was changing: it was
// substantially growing. I wondered how far this could go.<br><br>
//
// &nbsp;&nbsp;&nbsp;&nbsp;It was as I was writing while continuing to work the knots in my soul that I realized I was easily doing multiple things at once.
// My thoughts felt split, yet not incomplete; I had the attention to give to both things at once. What else could I do at the same time?
// `}
//
// actionData.harnessOverflow.storyText = { english:Raw.html`
// &nbsp;&nbsp;&nbsp;&nbsp;An insight quickly arose, gained as I became more aware of the currents of momentum flowing through my soul.
// I noticed, in those currents, that some was splashing over.<br><br>
//
// &nbsp;&nbsp;&nbsp;&nbsp;I observed the spillage - where would it go? - and found that, eventually, it always rejoined the current. Now that I was
// looking for it, I realized my other actions that momentum had latched onto had much more violent currents and eddies,
// whirling in place and creating knots of movement, hindering transference.<br><br>
//
// &nbsp;&nbsp;&nbsp;&nbsp;As I observed the various actions that I had thus felt out, I realized that Reflect and Distill Insight had some whirls
// I could smooth out by controlling their spins into joining the river quicker.<br><br>
//
// &nbsp;&nbsp;&nbsp;&nbsp;Overclock was a storm, and difficult for me to fully access. I didn't quite understand, but feeling out those complicated ever-changing knots,
//  it also sparked the tip of a memory. I had been confused - why was this familiar?
// `}
//
// actionData.distillInsight.storyText = { english:Raw.html`
// &nbsp;&nbsp;&nbsp;&nbsp;Almost immediately, my ability triggered successfully on yet another surprising option -
// the ability to understand what I was doing, to distill insight out of the complicated signals coming through.<br><br>
// `}
//
// actionData.reflect.storyText = { english:Raw.html`
// &nbsp;&nbsp;&nbsp;&nbsp;At first, I simply sat down and closed my eyes, and tried to feel, or see, or sense in any way something that was possible.<br><br>
//
// &nbsp;&nbsp;&nbsp;&nbsp;But to my surprise, it was the act of looking itself that I felt the momentum latch onto.
// I gained awareness - I was starting to understand the nature of how my ability was influencing things.
// However, as the monstrous complexity of what this meant started to hit me, I realized this would be a long journey indeed.<br><br>
//
// &nbsp;&nbsp;&nbsp;&nbsp;I needed to experiment more - was there more I could pull out of this?
// `}
//
//
// actionData.overclock.storyText = {english:Raw.html`
// &nbsp;&nbsp;&nbsp;&nbsp;"Choose a valid target; get a little more out of it" is the Description on my ability Overclock. Abilities are given intuitively,
// and the Description was part of that intuitive understanding, given as soon as one has understood all of the words within the Description.
// Overclock works by using the concept of momentum to improve the target over time. The target will be denied unless it meets the criteria,
// which is any type of action you can do over and over until you get better at it.<br><br>
//
// &nbsp;&nbsp;&nbsp;&nbsp;That feeling, that concept - momentum - had been spilling over somehow from when I had the target set to itself.
// It felt as if there was a spinning vortex of movement, with splashes leaking. Momentum had
// started to apply itself in small ways to anything I started doing that fit the targeting criteria, and the momentum had
// me continue doing whatever it was, helping me to do so as long as I needed.<br><br>
//
// &nbsp;&nbsp;&nbsp;&nbsp;As long as I stated doing something potentially targetable - even without me realizing it - the conceptual "spillover" from the vortex would latch on.<br><br>
//
// &nbsp;&nbsp;&nbsp;&nbsp;This was more than I ever anticipated. I had targeted Overclock to itself so that I would be prepared so that the next
// time a threat came along, I would have a large pool of a fate-bending resource, and therefore - at least once - be strong enough
// to save more than only myself. Maybe then, I could learn to find some measure of peace.`
// };
//
// actionData.remember.storyText = {english:Raw.html`
// Your world ended, and they only live on through you. Think about what they would
//     have wanted for you, and on how much you miss them, and let it drive you forward. This is an internal story as much
//     as it is an external one.`}
// actionData.makeMoney.storyText = {english:"Your motivation to overclock spills over throughout your mind. Your general drive expands, and you put this to use in making money. At first it's whatever odd jobs you can find, with later getting employed, Making Money is the gateway to improving your situation."}
// actionData.spendMoney.storyText={english:"At this village there are not many things to buy, but there are still the essentials you need. Buying things with the money you've earned gets you confidence, and the things improve your life to gain more energy."}
//
//
//
//
//
//
//
// actionData.meetVillageLeaderScott.storyText = {english:Raw.html`
// Introductions with Scott as a village leader are nothing to note - he tells me not to make trouble and that he's open to chatting about any problems. He wants to help make the community work well. He seems like a good man. Past the introductions, when I really strike up a conversation with him, he opens up.
//
// "Did you see any birds on the road?" the softly smiling man asks me, after we got the pleasantries out of the way. I didn't think to look for the birds, and told him so. "You should have! There's a particularly golden one I only got a glimpse of!" He's passionate about this, but I am not. There might still be something worthwhile in finding this "golden bird" though.
//
// I ask if I can help out, and he gives me a job! It's just helping him out with some chores, but he pays me for it.
//
// Scott is really nice. I wish more people like him existed - my life would have gone differently. The more I chat with him, the more I remember the few soldiers I knew who were similar. It's a good connection, a good memory, and I have precious few of those.
//
// It also reminds me of how those men died, which starts to be more than I can handle for the moment. I have to start reminding myself that this is somewhere safe, but ultimately I am not quite up to do the task of socialization. I'm glad I ended up here though, and for the peace it has offered me.
// `};
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



// story = [
//     {
//         english: "The world was ending. Mark has a Talent. Claire tells him to report to the Delvers Guild to help out. He does, eventually"
//     }
// ]