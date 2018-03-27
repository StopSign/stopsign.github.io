function Actions() {

    this.current = [];
    this.next = [];
    this.addAmount = 1;

    this.tick = function() {

    };

    this.restart = function() {
        this.current = this.next;
    };

    this.addLoop = function(index) {
        this.next[index].loops += this.addAmount;
        view.updateActions();
    };
    this.removeLoop = function(index) {
        this.next[index].loops -= this.addAmount;
        if(this.next[index].loops < 0) {
            this.next[index].loops = 0;
        }
        view.updateActions();
    };
    this.split = function(index) {
        const toSplit = this.next[index];
        console.log(index);
        this.addAction(camelize(toSplit.name), Math.ceil(toSplit.loops/2), index);
        toSplit.loops = Math.floor(toSplit.loops/2);
        view.updateActions();
    };
    this.moveUp = function(index) {
        if(index <= 0) {
            return;
        }
        const temp = this.next[index-1];
        this.next[index-1] = this.next[index];
        this.next[index] = temp;
        view.updateActions();
    };
    this.moveDown = function(index) {
        if(index >= this.next.length - 1) {
            return;
        }
        const temp = this.next[index+1];
        this.next[index+1] = this.next[index];
        this.next[index] = temp;
        view.updateActions();
    };
    this.removeAction = function(index) {
        this.next.splice(index, 1);
        view.updateActions();
    };

    this.addAction = function(action, loops, initialOrder) {
        let toAdd;
        if(action === "wander") {
            toAdd = new Wander()
        } else if(action === "smashPots") {
            toAdd = new SmashPots()
        }

        toAdd.loops = loops !== undefined ? loops : 1;
        toAdd.curTicks = 0;


        if(initialOrder !== undefined) {
            this.next.splice(initialOrder, 0, toAdd) //insert at index
        } else {
            this.next.push(toAdd);
        }

    };
}

function Wander() {
    this.name = "Wander";
    this.stats = {

    };
    this.ticksNeeded = function() {
        return 20;
    };
    this.finish = function() {

    }
}

function SmashPots() {
    this.name = "Smash Pots";
    this.stats = {
        Str:.2,
        Per:.2,
        Spd:.6,
        expMult:1
    };
    this.ticksNeeded = function() {
        return 20;
    };
    this.finish = function() {

    }

}