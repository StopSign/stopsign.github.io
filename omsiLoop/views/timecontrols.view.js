Views.registerView("timeControls", {
    selector: "#timeControls",
    stories() {
        let html = "";
        // eslint-disable-next-line no-unused-vars
        _txtsObj("time_controls>stories>story").each((index, story) => {
            html +=
            `<div id='story${$(story).attr("num")}'>
                ${$(story).text()}
            </div>`;
        });
        return html;
    },
    html() {
    // todo: add talent tree
        const html =
        `<div id='pausePlay' onclick='pauseGame()'' class='button control'>${_txt("time_controls>pause_button")}</div>
        <div onclick='restart()' class='button showthatO control'>${_txt("time_controls>restart_button")}
            <div class='showthis' style='color:black;width:230px;'>${_txt("time_controls>restart_text")}</div>
        </div>
        <div class='button showthatO control' onclick='toggleOffline()'>${_txt("time_controls>bonus_seconds>title")}
            <div class='showthis' style='width:230px;color:black;'>${_txt("time_controls>bonus_seconds>main_text")}
                <div class='bold' id='isBonusOn'>${_txt("time_controls>bonus_seconds>state>off")}</div><br>
                <div class='bold'>${_txt("time_controls>bonus_seconds>counter_text")}</div> <div id='bonusSeconds'></div>
            </div>
        </div>
        <div id='talentTreeBtn' style='display: none;' onclick='view.showTalents()'' class='button control'>${_txt("time_controls>talents_button")}</div>
        <div class='showthatO control'>
            <div class='showthatO' onmouseover='view.updateStory(storyShowing)' style='height:30px;'>
                <div class='large bold'>${_txt("time_controls>story_title")}</div>
                <div id='newStory' style='color:red;display:none;'>(!)</div>
                <div class='showthisH' style='width:400px;'>
                    <div style='margin-left:175px;' class='actionIcon fa fa-arrow-left control' id='storyLeft' onclick='view.updateStory(storyShowing-1)'></div>
                    <div style='' id='storyPage' class='bold control'></div>
                    <div style='' class='actionIcon fa fa-arrow-right control' id='storyRight' onclick='view.updateStory(storyShowing+1)'></div>
                    ${this.stories()}
                </div>
            </div>
        </div>
        <div class='control'>
            <input type='checkbox' id='pauseBeforeRestartInput' onchange='setOption("pauseBeforeRestart", this.checked)'>
            <label for='pauseBeforeRestartInput'>${_txt("time_controls>pause_before_restart")}</label>
        </div>
        <div class='control'>
            <input type='checkbox' id='pauseOnFailedLoopInput' onchange='setOption("pauseOnFailedLoop", this.checked)'>
            <label for='pauseOnFailedLoopInput'>${_txt("time_controls>pause_on_failed_loop")}</label>
        </div>`;
        return html;
    },
});

