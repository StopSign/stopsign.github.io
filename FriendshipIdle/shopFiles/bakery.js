//Emily has: current task (what progress currently goes towards), next task (what will be the current task when the current task is done
//Current task is used to "distract" emily from baking, and she
//task options: "deciding", "ordering", "mixing", "cooking", "finishing", "customer", "office"
//Deciding: Emily in the middle of bake shop, hand on chin, thinking. Lasts 2 seconds, then completes to the next task
let currentTask = "deciding";
let taskTimeReq = 2;
let taskTime = 0;


function tickEmily() {
    taskTime += 1/ticksPerSecond;
    if(taskTime < taskTimeReq) { //Animation goes here
        return;
    }
    if(currentTask === "deciding") {

    }

}

function createIngredient(ingredient) {
    ingredient.id = data.ingredientLength++;
    ingredient.baseCap = 1; // Initial store supply
    ingredient.maxBaseCap = 10; // Maximum store supply that can be bought
    ingredient.suppliersBought = 0; // Additional supply bought
    ingredient.amount = 0;
    ingredient.supply = ingredient.baseCap; // Setting initial supply to baseCap
    ingredient.storeMarketResponse = 0; // Tracks market response
    ingredient.storeMarketResponseLevel = 1;
    ingredient.supplierFamiliarity = 0;

    ingredient.buySupplier = function() {
        while ((this.baseCap + this.suppliersBought) < this.maxBaseCap && data.emily.money >= this.price * 10) {
            data.emily.money -= this.price * 10;
            this.suppliersBought++;
            this.baseCap++; // Increase the base supply capacity
        }
    };

    ingredient.getSupplyCap = function() {
        // Update to account for market response induced increases
        let marketResponseBonus = Math.min(Math.floor(this.storeMarketResponse / 10) * 0.1, 9);
        return this.baseCap * (1 + marketResponseBonus) * this.getFamiliarityMaxBonus();
    };

    ingredient.getStoreMarketResponseBonus = function() {
        return Math.floor((this.storeMarketResponse+.0000001) / 10) * 0.1;
    }

    ingredient.getFamiliarityStage = function() {
        if (this.supplierFamiliarity <= 1) {
            return 0;
        }
        let base10Stage = Math.floor(Math.log10(this.supplierFamiliarity));
        let base30Stage = Math.floor(Math.log10(this.supplierFamiliarity / 3));
        let maxStage = Math.max(base10Stage, base30Stage);
        return Math.min(maxStage, expertiseNames.length - 1);
    };

    ingredient.getFamiliarityName = function() {
        return familiarityNames[this.getFamiliarityStage()];
    };

    ingredient.getFamiliarityRefillBonus = function() {
        return Math.pow(2, this.getFamiliarityStage());
    };

    ingredient.getFamiliarityMaxBonus = function() {
        return Math.pow(1.3, this.getFamiliarityStage());
    };

    ingredient.buy = function(amountToBuy) {
        if (this.supply < amountToBuy) {
            amountToBuy = Math.min(this.supply, amountToBuy);
        }
        if (data.emily.money >= amountToBuy * this.price) {
            data.emily.money -= amountToBuy * this.price;
            this.supply -= amountToBuy;
            this.supplierFamiliarity++; // Increase familiarity for each item bought
            this.storeMarketResponse += amountToBuy; // Market response increases based on the amount bought
            if(this.storeMarketResponseLevel * 10 <= this.storeMarketResponse) {
                this.storeMarketResponse -= this.storeMarketResponseLevel * 10;
                this.storeMarketResponseLevel++;
            }
            return 1;
        }
        return 0; // In case the transaction is not successful
    };

    // Regenerates base/100 * refill bonus, so excluding the familiarity bonus to max
    ingredient.regenerateSupply = function() {
        let cap = this.getSupplyCap();
        this.supply += (this.suppliersBought + ingredient.baseCap) / 100 * this.getFamiliarityRefillBonus();
        if (this.supply > cap) {
            this.supply = cap;
        }
    };

    data.ingredients[ingredient.name] = ingredient;
}




function createRecipe(recipe) {
    recipe.totalPrice = function() {
        let total = 0;
        for (let name in this.ingredients) {
            if (this.ingredients.hasOwnProperty(name)) {
                let quantity = this.ingredients[name];
                let ingredientPrice = data.ingredients[name].price;
                total += quantity * ingredientPrice;
            }
        }
        return total;
    };

    recipe.sellPrice = function() {
        return this.totalPrice() * data.emily.sellProfitRatio;
    };

    recipe.expertise = 0;
    recipe.getExpertiseStage = function() {
        if (this.expertise === 0) {
            return 0;
        }
        return Math.min(Math.floor(Math.log10(this.expertise)), expertiseNames.length);
    }

    recipe.getExpertiseName = function() {
        return expertiseNames[this.getExpertiseStage()];
    }

    recipe.getMaximumBatchSize = function () {
        return this.getExpertiseStage() * 2 + 2;
    }

    recipe.getTimes = function() {
        return {
            mixingTime: this.mixingTime * this.getExpertiseBonus(),
            cookingTime: this.cookingTime,
            finishingTime: this.finishingTime * this.getExpertiseBonus()
        }
    }
    recipe.getTotalTime = function() {
        let times = recipe.getTimes();
        let difficultyMod = this.difficulty
        return times.mixingTime + times.cookingTime + times.finishingTime;
    }
    recipe.getExpertiseBonus = function() {
        return Math.pow(.95, this.getExpertiseStage());
    }

    //buying -> mixing -> cooking -> finishing -> add to display
    recipe.stage = "buying";
    recipe.batchSize = 0;
    recipe.timer = 0;
    recipe.batchEfficiency = .95;
    recipe.timeNeededForStage = recipe.getTimes().mixingTime
    recipe.getTimeNeededForStage = function() {
        const baseMixingTime = this.difficulty * this.mixingTime;
        const baseCookingTime = this.difficulty * this.cookingTime;
        const baseFinishingTime = this.difficulty * this.finishingTime;

        if (this.stage === "mixing") {
            let totalTime = 0;
            for (let i = 0; i < this.batchSize; i++) {
                totalTime += 1 - (i * 0.1);
            }
            return baseMixingTime * totalTime;
        }
        if (this.stage === "cooking") {
            return baseCookingTime * (1 + 0.2 * (this.batchSize - 1));
        }
        if (this.stage === "finishing") {
            let multiplier = 1;
            let totalTime = 0;
            for (let i = 0; i < this.batchSize; i++) {
                totalTime += multiplier;
                multiplier *= 0.95;
            }
            return baseFinishingTime * totalTime;
        }
    };


    recipe.progress = function() {
        //Assume Emily is free to try to bake
        //check for ingredients, if no return 0
        //if has ingredients, set stage to mixing
        //if stage is mixing and
    }


    data.recipes[recipe.name] = recipe;
}

//ingredients
{

    createIngredient({
        name: "eggs",
        displayNames: {
            english:"Eggs"
        },
        price: 3,
        cookingTool:"oven",
        difficulty:0
    });

    createIngredient({
        name:"flour",
        displayNames: {
            english:"Flour"
        },
        price:5,
        cookingTool:"oven",
        difficulty:0
    })

    createIngredient({
        name: "water",
        displayNames: {
            english:"Water"
        },
        price: 5,
        cookingTool:"oven",
        difficulty:1
    });

    createIngredient({
        name: "sugar",
        displayNames: {
            english:"Sugar"
        },
        price: 20,
        cookingTool:"oven",
        difficulty:0
    });

    createIngredient({
        name:"butter",
        displayNames: {
            english:"Butter"
        },
        price: 50,
        cookingTool:"oven",
        difficulty:0
    })

    createIngredient({
        name: "cornmeal",
        displayNames: {
            english:"Cornmeal"
        },
        price: 100,
        cookingTool:"oven",
        difficulty:1
    });

    createIngredient({
        name: "buttermilk",
        displayNames: {
            english:"Buttermilk"
        },
        price: 150,
        cookingTool:"oven",
        difficulty:1
    });

    createIngredient({
        name: "yeast",
        displayNames: {
            english:"Yeast"
        },
        price: 200,
        cookingTool:"oven",
        difficulty:1
    });

    createIngredient({
        name: "bananas",
        displayNames: {
            english:"Bananas"
        },
        price: 250,
        cookingTool:"oven",
        difficulty:1
    });

    createIngredient({
        name: "chocolate",
        displayNames: {
            english:"Chocolate"
        },
        price: 500,
        cookingTool:"oven",
        difficulty:1
    });

    createIngredient({
        name: "cinnamon",
        displayNames: {
            english:"Cinnamon"
        },
        price: 500,
        cookingTool:"oven",
        difficulty:1
    });

    createIngredient({
        name: "mascarpone",
        displayNames: {
            english:"Mascarpone"
        },
        price: 300,
        cookingTool:"oven",
        difficulty:1
    });

    createIngredient({
        name: "mascarpone",
        displayNames: {
            english:"Mascarpone"
        },
        price: 300,
        cookingTool:"oven",
        difficulty:2
    });

    createIngredient({
        name: "ladyfingers",
        displayNames: {
            english:"Ladyfingers"
        },
        price: 400,
        cookingTool:"oven",
        difficulty:2
    });

    createIngredient({
        name: "lemonJuice",
        displayNames: {
            english:"Lemon Juice"
        },
        price: 800,
        cookingTool:"oven",
        difficulty:2
    });

    createIngredient({
        name: "creamCheese",
        displayNames: {
            english:"Cream Cheese"
        },
        price: 1200,
        cookingTool:"oven",
        difficulty:2
    });

    createIngredient({
        name: "salt",
        displayNames: {
            english:"salt"
        },
        price: 1500,
        cookingTool:"oven",
        difficulty:2
    });

    createIngredient({
        name: "vanillaExtract",
        displayNames: {
            english:"Vanilla Extract"
        },
        price: 2000,
        cookingTool:"oven",
        difficulty:2
    });

    createIngredient({
        name: "heavyCream",
        displayNames: {
            english:"Heavy Cream"
        },
        price: 4000,
        cookingTool:"oven",
        difficulty:3
    });

    createIngredient({
        name: "dragonsMilk",
        displayNames: {
            english:"Dragon's Milk"
        },
        price: 400000,
        cookingTool:"oven",
        difficulty:5
    });

    createIngredient({
        name: "sourdoughStarter",
        displayNames: {
            english:"Sourdough Starter"
        },
        price: 6000,
        cookingTool:"oven",
        difficulty:3
    });

    createIngredient({
        name: "coffee",
        displayNames: {
            english:"Coffee"
        },
        price: 3000,
        cookingTool:"oven",
        difficulty:3
    });

    createIngredient({
        name: "oil",
        displayNames: {
            english:"Oil"
        },
        price: 10000,
        cookingTool:"oven",
        difficulty:4
    });

    createIngredient({
        name: "matchaPowder",
        displayNames: {
            english:"Matcha Powder"
        },
        price: 20000,
        cookingTool:"oven",
        difficulty:4
    });

    createIngredient({
        name: "pumpkinPuree",
        displayNames: {
            english:"Pumpkin Puree"
        },
        price: 15000,
        cookingTool:"oven",
        difficulty:4
    });

    createIngredient({
        name: "nutmeg",
        displayNames: {
            english:"Nutmeg"
        },
        price: 30000,
        cookingTool:"oven",
        difficulty:4
    });

    createIngredient({
        name: "apples",
        displayNames: {
            english:"Apples"
        },
        price: 50000,
        cookingTool:"oven",
        difficulty:4
    });

    createIngredient({
        name: "creamOfTartar",
        displayNames: {
            english:"Cream of Tartar"
        },
        price: 300000,
        cookingTool:"oven",
        difficulty:5
    });

    createIngredient({
        name: "almondFlour",
        displayNames: {
            english:"Almond Flour"
        },
        price: 200000,
        cookingTool:"oven",
        difficulty:5
    });

    createIngredient({
        name: "almonds",
        displayNames: {
            english:"Almonds"
        },
        price: 100000,
        cookingTool:"oven",
        difficulty:5
    });

    createIngredient({
        name: "molasses",
        displayNames: {
            english:"Molasses"
        },
        price: 1500000,
        cookingTool:"oven",
        difficulty:5
    });

    createIngredient({
        name: "ginger",
        displayNames: {
            english:"Ginger"
        },
        price: 500000,
        cookingTool:"oven",
        difficulty:5
    });

    createIngredient({
        name: "red",
        displayNames: {
            english:"Red"
        },
        price: 1000000,
        cookingTool:"oven",
        difficulty:5
    });

}


//TODO adjust when playing, maybe increase ingredients required for later stages
//recipes
{
    createRecipe({
        name: "muffins",
        displayNames: {
            english:"Muffins"
        },
        difficulty: 2, //general modifier to time it takes
        ingredients: {
            flour: 1,
            eggs: 1,
            sugar: 1
        },
        mixingTime: 4,
        cookingTime: 5,
        finishingTime: 1
    })

    createRecipe({
        name: "shortbreadCookies",
        displayNames: {
            english:"ShortBread Cookies"
        },
        difficulty: 4,
        ingredients: {
            flour: 1,
            sugar: 1,
            butter: 1
        },
        mixingTime: 5,
        cookingTime: 4,
        finishingTime: 1
    })

    createRecipe({
        name: "cornBread",
        displayNames: {
            english:"Corn Bread"
        },
        difficulty: 7,
        ingredients: {
            flour:2,
            eggs:4,
            cornmeal:1,
            buttermilk:2
        },
        mixingTime: 3,
        cookingTime: 6,
        finishingTime:1
    })

    createRecipe({
        name: "bagels",
        displayNames: {
            english:"Bagels"
        },
        difficulty: 8,
        ingredients: {
            flour:3,
            water:2,
            sugar:2,
            yeast:3
        },
        mixingTime: 3.5,
        cookingTime: 6,
        finishingTime:.5
    })

    createRecipe({
        name: "brownies",
        displayNames: {
            english:"Brownies"
        },
        difficulty: 8,
        ingredients: {
            flour:4,
            eggs:4,
            sugar:2,
            butter:2,
            chocolate:1
        },
        mixingTime: 2.5,
        cookingTime: 7,
        finishingTime:.5
    })

    createRecipe({
        name: "bananaBread",
        displayNames: {
            english:"Banana Bread"
        },
        difficulty: 9,
        ingredients: {
            flour:6,
            eggs:4,
            sugar:4,
            butter:3,
            bananas:2
        },
        mixingTime: 3.5,
        cookingTime: 6,
        finishingTime:.5
    })

    createRecipe({
        name: "eclairs",
        displayNames: {
            english:"Eclairs"
        },
        difficulty: 11,
        ingredients: {
            flour:10,
            eggs:4,
            sugar:8,
            butter:4,
            chocolate:4
        },
        mixingTime: 3,
        cookingTime: 4,
        finishingTime:3
    })

    createRecipe({
        name: "cinnamonRolls",
        displayNames: {
            english:"Cinnamon Rolls"
        },
        difficulty: 12,
        ingredients: {
            flour:10,
            eggs:4,
            sugar:8,
            cinnamon:1,
            yeast:10
        },
        mixingTime: 4,
        cookingTime: 4,
        finishingTime:2
    })

    createRecipe({
        name: "chocolateSouffle",
        displayNames: {
            english:"Chocolate Souffle"
        },
        difficulty: 13,
        ingredients: {
            eggs:8,
            sugar:8,
            butter:10,
            chocolate:6
        },
        mixingTime: 3,
        cookingTime: 6,
        finishingTime:1
    })

    createRecipe({
        name: "madeleines",
        displayNames: {
            english:"Madeleienes"
        },
        difficulty: 14,
        ingredients: {
            flour:10,
            eggs:4,
            sugar:16,
            lemonJuice:2
        },
        mixingTime: 4,
        cookingTime: 5,
        finishingTime:1
    })

    createRecipe({
        name: "lemonBars",
        displayNames: {
            english:"Lemon Bars"
        },
        difficulty: 15,
        ingredients: {
            flour:10,
            eggs:4,
            sugar:16,
            butter:10,
            lemonJuice:4
        },
        mixingTime: 3.5,
        cookingTime: 5.5,
        finishingTime:1
    })

    createRecipe({
        name: "cheesecake",
        displayNames: {
            english:"Cheesecake"
        },
        difficulty: 16,
        ingredients: {
            eggs:8,
            sugar:32,
            butter:15,
            vanillaExtract:1,
            creamCheese:3
        },
        mixingTime: 2,
        cookingTime: 7,
        finishingTime:1
    })

    createRecipe({
        name: "sourdoughBread",
        displayNames: {
            english:"Sourdough Bread"
        },
        difficulty: 17,
        ingredients: {
            flour:20,
            water:8,
            salt:1,
            sourdoughStarter:1
        },
        mixingTime: 2,
        cookingTime: 7,
        finishingTime:1
    })

    createRecipe({
        name: "cremeBrulee",
        displayNames: {
            english:"Creme Brulee"
        },
        difficulty: 18,
        ingredients: {
            eggs:8,
            sugar:32,
            vanillaExtract:3,
            heavyCream:1
        },
        mixingTime: 2.5,
        cookingTime: 5,
        finishingTime:2.5
    })

    createRecipe({
        name: "tiramisu",
        displayNames: {
            english:"Tiramisu"
        },
        difficulty: 20,
        ingredients: {
            eggs:20,
            sugar:64,
            vanillaExtract:5,
            coffee:4,
            heavyCream:1
        },
        mixingTime: 5,
        cookingTime: 4,
        finishingTime:1
    })

    createRecipe({
        name: "churros",
        displayNames: {
            english:"Churros"
        },
        difficulty: 23,
        ingredients: {
            flour:30,
            water:16,
            sugar:64,
            oil:5
        },
        mixingTime: 4,
        cookingTime: 4,
        finishingTime:1
    })

    createRecipe({
        name: "gourmetDoughnuts",
        displayNames: {
            english:"Gourmet Doughnuts"
        },
        difficulty: 27,
        ingredients: {
            flour:30,
            sugar:64,
            yeast:30,
            oil:15
        },
        mixingTime: 4,
        cookingTime: 5,
        finishingTime:1
    })

    createRecipe({
        name: "matchaCookies",
        displayNames: {
            english:"Matcha Cookies"
        },
        difficulty: 29,
        ingredients: {
            flour:30,
            sugar:64,
            butter:20,
            matchaPowder:10
        },
        mixingTime: 5,
        cookingTime: 4,
        finishingTime:1
    })

    createRecipe({
        name: "applePie",
        displayNames: {
            english:"Apple Pie"
        },
        difficulty: 30,
        ingredients: {
            flour:40,
            sugar:64,
            butter:30,
            cinnamon:40,
            apples:6
        },
        mixingTime: 3,
        cookingTime: 6,
        finishingTime:1
    })

    createRecipe({
        name: "spicedPumpkinLoaf",
        displayNames: {
            english:"Spiced Pumpkin Loaf"
        },
        difficulty: 34,
        ingredients: {
            flour:40,
            eggs:40,
            nutmeg:15,
            pumpkinPuree:20
        },
        mixingTime: 3.5,
        cookingTime: 6,
        finishingTime:.5
    })

    createRecipe({
        name: "biscotti",
        displayNames: {
            english:"Biscotti"
        },
        difficulty: 36,
        ingredients: {
            flour:50,
            sugar:64,
            eggs:8,
            almonds:10
        },
        mixingTime: 4,
        cookingTime: 5,
        finishingTime:1
    })

    createRecipe({
        name: "angelFoodCake",
        displayNames: {
            english:"Angel Food Cake"
        },
        difficulty: 38,
        ingredients: {
            flour:50,
            eggs:8,
            sugar:100,
            creamOfTartar:5
        },
        mixingTime: 4,
        cookingTime: 4,
        finishingTime:2
    })

    createRecipe({
        name: "operaCake",
        displayNames: {
            english:"Opera Cake"
        },
        difficulty: 44,
        ingredients: {
            eggs:40,
            sugar:100,
            coffee:60,
            almondFlour:20
        },
        mixingTime: 4,
        cookingTime: 3,
        finishingTime:3
    })

    createRecipe({
        name: "macarons",
        displayNames: {
            english:"Macarons"
        },
        difficulty: 54,
        ingredients: {
            eggs:40,
            sugar:100,
            almondFlour:80,
            creamOfTartar: 15
        },
        mixingTime: 4,
        cookingTime: 4,
        finishingTime:2
    })

    createRecipe({
        name: "redVelvetCake",
        displayNames: {
            english:"Red Velvet Cake"
        },
        difficulty: 58,
        ingredients: {
            flour:60,
            buttermilk:20,
            chocolate:100,
            red:30
        },
        mixingTime: 3,
        cookingTime: 6,
        finishingTime:1
    })

    createRecipe({
        name: "gingerBread",
        displayNames: {
            english:"Gingerbread"
        },
        difficulty: 64,
        ingredients: {
            flour:60,
            butter:300,
            cinnamon:300,
            molasses:50,
            ginger:50
        },
        mixingTime: 3.5,
        cookingTime: 5.5,
        finishingTime:1
    })

    createRecipe({
        name: "croissant",
        displayNames: {
            english:"Croissant"
        },
        difficulty: 64,
        ingredients: {
            flour:500,
            butter:500,
            yeast:500,
            dragonsMilk:500
        },
        mixingTime: 3,
        cookingTime: 6,
        finishingTime:1
    })


}

console.log("Total price of muffins: ", data.recipes.muffins.totalPrice());

